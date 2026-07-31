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
import { Predio } from '../database/entities/predio.entity';
import { Distrito } from '../database/entities/distrito.entity';
import { FormSubmission } from '../database/entities/form-submission.entity';

const parseBackendDate = (val: string) => {
  if (!val || val === '-') return null;
  
  // If format is "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return new Date(val);
  }
  
  // If format is "DD/MM/YYYY" or "D/M/YYYY"
  const match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const d = parseInt(match[1], 10);
    const m = parseInt(match[2], 10) - 1; // 0-indexed month
    const y = parseInt(match[3], 10);
    return new Date(y, m, d);
  }
  
  // Fallback to native constructor
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity) private readonly opportunitiesRepository: Repository<Opportunity>,
    @InjectQueue('report-generation') private readonly reportQueue: Queue
  ) {}
  
  async createOpportunity(user: any, dto: CreateOpportunityDto, manager: EntityManager) {
    // 1. Buscar la etapa inicial para el pipeline solicitado
    let targetStage: PipelineStage | null = null;
    
    const codeToSearch = ((user.role === 'ADMIN' || user.role === 'BACKOFFICE' || user.role === 'BACKOFFICE_VENTAS') && dto.initialStageCode)
      ? dto.initialStageCode
      : ((user.role === 'ADMIN' || user.role === 'BACKOFFICE' || user.role === 'BACKOFFICE_VENTAS') ? 'S4' : null);

    if (codeToSearch) {
      // Primero intentar match exacto
      targetStage = await manager.findOne(PipelineStage, {
        where: { pipelineId: dto.pipelineId, code: codeToSearch }
      });

      // Si no hay match exacto, intentar match por sufijo (S4 → busca %-S4)
      if (!targetStage && /^S\d+$/i.test(codeToSearch)) {
        targetStage = await manager
          .createQueryBuilder(PipelineStage, 'ps')
          .where('ps.pipelineId = :pipelineId', { pipelineId: dto.pipelineId })
          .andWhere('ps.code LIKE :suffix', { suffix: `%-${codeToSearch.toUpperCase()}` })
          .getOne();
      }
    }

    if (!targetStage) {
      targetStage = await manager.findOne(PipelineStage, {
        where: { pipelineId: dto.pipelineId, isInitial: true }
      });
    }

    if (!targetStage) {
      throw new BadRequestException('El pipeline seleccionado no tiene configurada una etapa válida.');
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
      currentStageId: targetStage.id,
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
      toStageId: targetStage.id,
      changedByUserId: user.id,
      reason: 'Creación de la oportunidad'
    });

    await manager.save(history);

    return savedOpportunity;
  }

  async createOpportunitiesBulk(user: any, dtos: CreateOpportunityDto[], manager: EntityManager) {
    const results = [];
    for (const dto of dtos) {
      try {
        const opp = await this.createOpportunity(user, dto, manager);
        results.push(opp);
      } catch (error) {
        console.error(`Error creando oportunidad bulk para predio ${dto.propertyId}:`, error);
      }
    }
    return results;
  }




  async executeAutomaticTransition(opportunityId: string, toCode: string) {
    const manager = this.opportunitiesRepository.manager;
    try {
      const opportunity = await manager.findOne(Opportunity, { where: { id: opportunityId } });
      if (!opportunity) return;

      const newStage = await manager.findOne(PipelineStage, { where: { code: toCode, pipelineId: opportunity.pipelineId } });
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

  async getSubmissions(id: string, user: any) {
    const manager = this.opportunitiesRepository.manager;
    
    // Si no es ADMIN, verificar que la oportunidad pertenece a su compañía
    const isAgencyAdmin = user.globalRole === 'AGENCY_ADMIN' || user.role === 'AGENCY_ADMIN';
    if (!isAgencyAdmin) {
      const opp = await manager.findOne(Opportunity, {
        where: { id, companyId: user.companyId }
      });
      if (!opp) throw new NotFoundException('Oportunidad no encontrada o sin acceso');
    }

    return manager.find(FormSubmission, {
      where: { opportunityId: id },
      order: { createdAt: 'ASC' }
    });
  }
}
