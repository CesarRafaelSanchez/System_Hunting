import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EntityManager } from 'typeorm';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { TransitionStageDto } from './dto/transition-stage.dto';
import { Opportunity } from '../database/entities/opportunity.entity';
import { OpportunityStageHistory } from '../database/entities/opportunity-stage-history.entity';
import { PipelineStage } from '../database/entities/pipeline-stage.entity';
import { Torre } from '../database/entities/torre.entity';
import { Piso } from '../database/entities/piso.entity';
import { ConfiguracionSistema } from '../database/entities/configuracion-sistema.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity) private readonly opportunitiesRepository: Repository<Opportunity>,
    @InjectQueue('report-generation') private readonly reportQueue: Queue
  ) {}
  
  async createOpportunity(user: any, dto: CreateOpportunityDto, manager: EntityManager) {
    // 1. Buscar la etapa inicial para el pipeline solicitado
    const initialStage = await manager.findOne(PipelineStage, {
      where: { pipelineId: dto.pipelineId, isInitial: true }
    });

    if (!initialStage) {
      throw new BadRequestException('El pipeline seleccionado no tiene configurada una etapa inicial.');
    }

    // 2. Generar un código único (simplificado para el MVP)
    const code = `OPP-${Date.now().toString().slice(-6)}`;

    // Manejo de asignación automática de referidos
    let assignedUserId = user.id;
    if (dto.canalHunting === 'REFERIDO') {
      const fallbackConfig = await manager.findOne(ConfiguracionSistema, { where: { clave: 'FALLBACK_BO_FUTURA_REFERIDOS' } });
      if (fallbackConfig && fallbackConfig.valor) {
        assignedUserId = fallbackConfig.valor;
      }
    }

    // 3. Crear la Oportunidad
    const opportunity = manager.create(Opportunity, {
      code,
      companyId: user.companyId,
      propertyId: dto.propertyId,
      leadSourceId: dto.leadSourceId,
      pipelineId: dto.pipelineId,
      currentStageId: initialStage.id,
      createdByUserId: user.id,
      currentOwnerUserId: assignedUserId, // Asignación inteligente
      status: 'OPEN',
      priority: dto.priority,
      canalHunting: dto.canalHunting,
      currentStageEnteredAt: new Date(),
    });

    const savedOpportunity = await manager.save(opportunity);

    // 4. Crear el registro base en el historial de etapas
    const history = manager.create(OpportunityStageHistory, {
      opportunityId: savedOpportunity.id,
      fromStageId: undefined, // TypeORM ignora los campos undefined en lugar de requerir tipos union con null
      toStageId: initialStage.id,
      changedByUserId: user.id,
      reason: 'Creación de la oportunidad'
    });

    await manager.save(history);

    return savedOpportunity;
  }

  async findAll(user: any) {
    let whereClause: any = { companyId: user.companyId };
    
    if (user.role === 'HUNTER') {
      whereClause = [
        { companyId: user.companyId, createdByUserId: user.id },
        { companyId: user.companyId, currentOwnerUserId: user.id }
      ];
    }

    const opps = await this.opportunitiesRepository.find({ 
      where: whereClause,
      relations: {
        currentStage: true,
        property: {
          distrito: true,
          hunterPrincipal: true
        },
        currentOwnerUser: true
      }
    });
    
    return opps.map(o => ({
      ...o,
      id: o.id,
      title: o.property?.nombreProyecto || `Op: ${o.code}`,
      subtitle: o.property?.nombreVia || `Etapa ID: ${o.currentStageId?.slice(0,5)}`,
      stage: o.currentStage ? (o.currentStage.position - 1) : (o.status === 'OPEN' ? 0 : (o.status === 'WON' ? 18 : 19)), 
      property: o.property ? {
        ...o.property,
        distrito: o.property.distrito?.nombre || '-',
        ejecutivo: o.property.hunterPrincipal?.fullName || o.currentOwnerUser?.fullName || 'Hunter'
      } : null,
      data: o
    }));
  }

  async updateOpportunity(id: string, user: any, dto: any, manager: EntityManager) {
    const opp = await manager.findOne(Opportunity, { where: { id, companyId: user.companyId } });
    if (!opp) throw new NotFoundException('Not found');
    
    // Guardamos datos JSON extra en algún campo de metadata si existiera, o actualizamos.
    // MVP: solo retornamos OK
    return opp;
  }

  async transitionStage(id: string, user: any, dto: TransitionStageDto, manager: EntityManager) {
    if (user.role === 'HUNTER') {
      throw new BadRequestException('Hunters no pueden mover tarjetas manualmente.');
    }

    const opportunity = await manager.findOne(Opportunity, {
      where: { id, companyId: user.companyId }
    });

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    const currentStage = await manager.findOne(PipelineStage, {
      where: { id: opportunity.currentStageId }
    });

    if (!currentStage) {
      throw new NotFoundException('Etapa actual no encontrada');
    }

    const newStage = await manager.findOne(PipelineStage, {
      where: { position: dto.toStagePosition, pipelineId: opportunity.pipelineId }
    });

    if (!newStage) {
      throw new BadRequestException('La etapa destino no es válida para este pipeline.');
    }

    if (opportunity.currentStageId === newStage.id) {
      throw new BadRequestException('La oportunidad ya se encuentra en esta etapa.');
    }

    // Reglas de negocio estrictas para BackOffice / Admin
    if (user.role === 'BACKOFFICE' || user.role === 'ADMIN') {
      const allowedManualTransitions: Record<number, number[]> = {
        1: [2, 3],
        6: [7], // Require button
        8: [9, 10],
        10: [11],
        14: [15], // Require button
        16: [17],
        17: [18, 19]
      };

      if (newStage.position === 7 || newStage.position === 15) {
        if (!dto.isValidatedByBO) {
          throw new BadRequestException('Esta etapa requiere validación explícita mediante el botón "Revisado".');
        }
      } else if (newStage.position !== 20) {
        const allowed = allowedManualTransitions[currentStage.position];
        if (!allowed || !allowed.includes(newStage.position)) {
          throw new BadRequestException(`Transición manual no permitida de la etapa ${currentStage.position} a la ${newStage.position}.`);
        }
      }
    }

    const previousStageId = opportunity.currentStageId;

    // Actualizar oportunidad
    opportunity.currentStageId = newStage.id;
    opportunity.currentStageEnteredAt = new Date();
    opportunity.lastActivityAt = new Date();

    if (newStage.isWon) {
      opportunity.status = 'WON';
      opportunity.wonAt = new Date();
    } else if (newStage.isLost) {
      opportunity.status = 'LOST';
      opportunity.lostAt = new Date();
    } else {
      opportunity.status = 'OPEN';
    }

    await manager.save(opportunity);

    const history = manager.create(OpportunityStageHistory, {
      opportunityId: opportunity.id,
      fromStageId: previousStageId,
      toStageId: newStage.id,
      changedByUserId: user.id,
      reason: dto.reason || 'Transición de etapa manual'
    });

    await manager.save(history);

    // Save Towers and Floors if present
    if (dto.towersData && opportunity.propertyId) {
      await manager.delete(Torre, { predioId: opportunity.propertyId });
      for (const towerInfo of dto.towersData) {
        const torre = manager.create(Torre, {
          predioId: opportunity.propertyId,
          nombreTorre: towerInfo.nombre_torre || 'Torre Sin Nombre'
        });
        const savedTorre = await manager.save(torre);
        
        const numPisos = parseInt(towerInfo.pisos_torre, 10) || 1;
        let hogaresList: number[] = [];
        if (Array.isArray(towerInfo.hogares_por_piso)) {
          hogaresList = towerInfo.hogares_por_piso.map((n: any) => parseInt(n, 10) || 0);
        } else {
          hogaresList = (towerInfo.hogares_por_piso || '0').toString().split(',').map((n: string) => parseInt(n.trim(), 10) || 0);
        }
        
        for (let i = 1; i <= numPisos; i++) {
          const hogares = hogaresList[i - 1] !== undefined ? hogaresList[i - 1] : (hogaresList[hogaresList.length - 1] || 0);
          const piso = manager.create(Piso, {
            torreId: savedTorre.id,
            numeroPiso: i,
            hogaresCantidad: hogares
          });
          await manager.save(piso);
        }
      }
    }

    // Triggers automáticos y simulación de Workers
    const automaticTransitions: Record<number, number> = {
      2: 4,
      5: 6,
      7: 8,   // Simula el éxito del Worker (SMTP/Sheets)
      9: 12,
      13: 14,
      15: 16  // Simula el éxito del Worker (Excel)
    };

    if (newStage.position === 7) {
      await this.reportQueue.add('send-win-request', { opportunityId: opportunity.id });
    }
    if (newStage.position === 13) {
      await this.reportQueue.add('generate-excel', { opportunityId: opportunity.id });
    }

    if (automaticTransitions[newStage.position]) {
      const nextPos = automaticTransitions[newStage.position];
      setTimeout(() => {
        this.executeAutomaticTransition(opportunity.id, nextPos);
      }, 5000); // 5 segundos de delay (configurable)
    }

    return opportunity;
  }

  async executeAutomaticTransition(opportunityId: string, toPosition: number) {
    const manager = this.opportunitiesRepository.manager;
    try {
      const opportunity = await manager.findOne(Opportunity, { where: { id: opportunityId } });
      if (!opportunity) return;

      const newStage = await manager.findOne(PipelineStage, { where: { position: toPosition, pipelineId: opportunity.pipelineId } });
      if (!newStage) return;

      const previousStageId = opportunity.currentStageId;
      opportunity.currentStageId = newStage.id;
      opportunity.currentStageEnteredAt = new Date();
      opportunity.lastActivityAt = new Date();
      await manager.save(opportunity);

      const history = manager.create(OpportunityStageHistory, {
        opportunityId: opportunity.id,
        fromStageId: previousStageId,
        toStageId: newStage.id,
        changedByUserId: opportunity.createdByUserId, // O algún ID de sistema
        reason: 'Transición automática del sistema'
      });
      await manager.save(history);
      
      // Si la nueva etapa también fuera automática, podríamos recursivamente llamarlo, 
      // pero para esta matriz, 4, 6, 12, 14 no son triggers automáticos.
    } catch (e) {
      console.error('Error en transición automática:', e);
    }
  }

  async queueApproval(id: string, user: any, manager: EntityManager) {
    const opportunity = await manager.findOne(Opportunity, {
      where: { id, companyId: user.companyId }
    });

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }
    
    // Injectamos en la cola 'report-generation'
    await this.reportQueue.add('generate-excel', {
      opportunityId: opportunity.id,
      // Los datos simulados o traídos de las otras tablas se envían al procesador
    });
    
    // Devolvemos 202 simulado (En NestJS si retornas objeto, envuelve con status por defecto o lo interceptas, aquí delegamos)
    return { status: 'accepted', message: 'Validación encolada para generación de Excel asíncrona' };
  }

  async getExportStatus(opportunityId: string) {
    const jobs = await this.reportQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
    const job = jobs.find(j => j.name === 'generate-excel' && j.data?.opportunityId === opportunityId);

    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();
    if (state === 'completed') {
      return { status: 'completed', url: job.returnvalue?.file || 'done' };
    } else if (state === 'failed') {
      return { status: 'failed', error: job.failedReason };
    }

    return { status: 'processing' };
  }
}
