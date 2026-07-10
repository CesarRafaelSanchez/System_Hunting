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
          hunterPrincipal: true,
          torres: {
            pisos: true
          }
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
    const opp = await manager.findOne(Opportunity, {
      where: { id, companyId: user.companyId },
      relations: { property: true },
    });
    if (!opp) throw new NotFoundException('Oportunidad no encontrada.');

    // ── Actualizar campos del Predio con los datos del formulario ─────────────────
    if (opp.property && dto) {
      const predio = opp.property;

       // Campos comunes a Form2 y Form3
      if (dto.nombreProyecto && dto.nombreProyecto !== '-')   predio.nombreProyecto   = dto.nombreProyecto;
      if (dto.tipoVia && dto.tipoVia !== '-')          predio.tipoVia          = dto.tipoVia;
      if (dto.nombreVia && dto.nombreVia !== '-') {
        let nombreClean = dto.nombreVia.trim();
        const tipoClean = (dto.tipoVia || predio.tipoVia || '').trim();
        const removeAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const normTipo = removeAccents(tipoClean);
        while (tipoClean && removeAccents(nombreClean).startsWith(normTipo)) {
          nombreClean = nombreClean.substring(tipoClean.length).trim();
        }
        predio.nombreVia = nombreClean;
      }
      if (dto.numeracionesVia && dto.numeracionesVia !== '-')  predio.numeracionMunicipal = dto.numeracionesVia;
      if (dto.numeracionVia && dto.numeracionVia !== '-')    predio.numeracionMunicipal = dto.numeracionVia;
      
      if (dto.fechaEntrega && dto.fechaEntrega !== '-') {
        const parsed = parseBackendDate(dto.fechaEntrega);
        if (parsed) predio.fechaEntrega = parsed;
      }
      if (dto.fechaMontantes && dto.fechaMontantes !== '-') {
        const parsed = parseBackendDate(dto.fechaMontantes);
        if (parsed) predio.terminoMontantes = parsed;
      }

      if (dto.horarioVisita && dto.horarioVisita !== '-')    predio.horarioVisita    = dto.horarioVisita;
      if (dto.urbanizacion && dto.urbanizacion !== '-')     predio.urbanizacionZona = dto.urbanizacion;
      if (dto.codigoPostal && dto.codigoPostal !== '-')     predio.codigoPostal     = dto.codigoPostal;
      if (dto.clientesInteresados && dto.clientesInteresados !== '-') predio.clientesInteresados = parseInt(dto.clientesInteresados, 10) || 0;

      // Coordenadas: "lat, lng" -> point(lon, lat)
      if (dto.coordenadas && dto.coordenadas !== '-') {
        const match = dto.coordenadas.match(/(-?\d+(?:\.\d+)?)\s*[,\s;\/]*\s*(-?\d+(?:\.\d+)?)/);
        if (match) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);
          if (!isNaN(lat) && !isNaN(lng)) {
            predio.coordenadasGps = { x: lng, y: lat };
          }
        }
      }

      // Distrito: resolver por nombre si viene como string
      if (dto.distrito && typeof dto.distrito === 'string' && dto.distrito !== '-') {
        let distrito = await manager.createQueryBuilder(Distrito, 'd')
          .where('LOWER(TRIM(d.nombre)) = LOWER(TRIM(:nombre))', { nombre: dto.distrito.trim() })
          .getOne();
        if (!distrito) {
          distrito = manager.create(Distrito, { nombre: dto.distrito.trim() });
          await manager.save(distrito);
        }
        predio.distritoId = distrito.id;
      }

      // Hogares y torres
      if (dto.numeroHPs && dto.numeroHPs !== '-')     predio.totalHogares = parseInt(dto.numeroHPs, 10) || predio.totalHogares;
      if (dto.totalHogares && dto.totalHogares !== '-')  predio.totalHogares = parseInt(dto.totalHogares, 10) || predio.totalHogares;
      if (dto.totalTorres && dto.totalTorres !== '-')   predio.totalTorres  = parseInt(dto.totalTorres, 10) || predio.totalTorres;

      // Tipo de edificio y estado
      if (dto.tipoEdificio && dto.tipoEdificio !== '-')  predio.clasificacionProyecto = dto.tipoEdificio;
      if (dto.tipoProyecto && dto.tipoProyecto !== '-')  predio.tipoDesarrollo        = dto.tipoProyecto;
      const estrenoVal = dto.estreno || dto.edificioEstreno || dto.esEstreno;
      if (estrenoVal && estrenoVal !== '-')            predio.estadoConstruccion    = estrenoVal;
      if (dto.juntaDirectiva && dto.juntaDirectiva !== '-') predio.juntaDirectiva       = dto.juntaDirectiva;
      if (dto.visitaInspeccion && dto.visitaInspeccion !== '-') {
        const parsed = parseBackendDate(dto.visitaInspeccion);
        if (parsed) predio.fechaVisitaTecnica = parsed;
      }

      if (dto.currentOwnerUserId && dto.currentOwnerUserId !== '-') {
        let userId = dto.currentOwnerUserId.trim();
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(userId);
        if (!isUuid) {
          // Resolve by name or email (exact or partial match)
          const resolved = await manager.query(
            `SELECT id FROM users 
             WHERE LOWER(TRIM(full_name)) = LOWER($1) 
                OR LOWER(TRIM(email)) = LOWER($1)
                OR LOWER(full_name) LIKE $2
                OR LOWER(email) LIKE $2
             LIMIT 1`,
            [userId, `%${userId.toLowerCase()}%`]
          );
          if (resolved && resolved.length > 0) {
            userId = resolved[0].id;
          }
        }
        
        const isValidUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(userId);
        if (isValidUuid) {
          opp.currentOwnerUserId = userId;
          predio.hunterPrincipalId = userId;
        }
      }

      await manager.save(Predio, predio);

      // Save Towers and Floors if present in updateOpportunity
      if (dto.towersData) {
        await manager.delete(Torre, { predioId: predio.id });
        let calculatedTotalHogares = 0;
        for (const towerInfo of dto.towersData) {
          const torre = manager.create(Torre, {
            predioId: predio.id,
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
            calculatedTotalHogares += hogares;
            const piso = manager.create(Piso, {
              torreId: savedTorre.id,
              numeroPiso: i,
              hogaresCantidad: hogares
            });
            await manager.save(piso);
          }
        }
        predio.totalTorres = dto.towersData.length;
        predio.totalHogares = calculatedTotalHogares;
        await manager.save(Predio, predio);
      }
    }

    if (dto) {
      if (dto.nombreCanal && dto.nombreCanal !== '-') {
        opp.canalHunting = dto.nombreCanal;
      }
      if (dto.canalHunting && dto.canalHunting !== '-') {
        opp.canalHunting = dto.canalHunting;
      }
    }


    // ── Guardar el payload JSON en form_submissions (si hay datos) ────────────────
    if (dto && Object.keys(dto).length > 0) {
      const formType = dto._formType || 'FORM_GENERIC';
      try {
        if (formType === 'FORM_GENERIC') {
          // Si viene del BackOffice (sin _formType específico), actualizamos las sumisiones existentes
          const formCodes = ['FORM_ASIGNACION', 'FORM_FICHA_DATOS'];
          for (const code of formCodes) {
            const existingSub = await manager.query(
              `SELECT fs.id, fs.raw_payload_json FROM form_submissions fs
               JOIN forms f ON fs.form_id = f.id
               WHERE fs.opportunity_id = $1 AND f.code = $2
               ORDER BY fs.submitted_at DESC LIMIT 1`,
              [opp.id, code]
            );
            if (existingSub && existingSub.length > 0) {
              const mergedPayload = {
                ...(existingSub[0].raw_payload_json || {}),
                ...dto
              };
              await manager.query(
                `UPDATE form_submissions SET raw_payload_json = $1::jsonb WHERE id = $2`,
                [JSON.stringify(mergedPayload), existingSub[0].id]
              );
            }
          }
        }

        await manager.query(
          `INSERT INTO form_submissions (form_id, company_id, opportunity_id, property_id, submitted_by_user_id, status, raw_payload_json)
           SELECT id, $2, $3, $4, $5, 'SUBMITTED', $6::jsonb
           FROM forms WHERE code = $1
           LIMIT 1`,
          [formType, user.companyId, opp.id, opp.propertyId, user.id, JSON.stringify(dto)]
        );
      } catch (e) {
        // Si no existe el form configurado, se omite sin romper el flujo
        console.warn('[updateOpportunity] form_submissions update/insert skipped:', e.message);
      }
    }

    opp.lastActivityAt = new Date();
    await manager.save(opp);
    return opp;
  }

  async transitionStage(id: string, user: any, dto: TransitionStageDto, manager: EntityManager) {
    // Hunters solo pueden completar sus propios formularios (4→5 y 12→13)
    const HUNTER_ALLOWED_TRANSITIONS: Record<number, number[]> = {
      4: [5],   // Pendiente Form Asignación → Form Asignación Completado
      12: [13], // Pendiente Form Ficha Datos → Form Ficha Datos Completado
    };

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

    // Reglas de negocio para HUNTER: solo puede completar sus formularios
    if (user.role === 'HUNTER') {
      const allowed = HUNTER_ALLOWED_TRANSITIONS[currentStage.position];
      if (!allowed || !allowed.includes(newStage.position)) {
        throw new BadRequestException(`Hunters solo pueden completar los formularios asignados (etapa ${currentStage.position} → ${newStage.position} no permitida).`);
      }
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
      let calculatedTotalHogares = 0;

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
          calculatedTotalHogares += hogares;
          const piso = manager.create(Piso, {
            torreId: savedTorre.id,
            numeroPiso: i,
            hogaresCantidad: hogares
          });
          await manager.save(piso);
        }
      }

      // Actualizar totalTorres y totalHogares en el predio
      await manager.update(Predio, opportunity.propertyId, {
        totalTorres: dto.towersData.length,
        totalHogares: calculatedTotalHogares
      });
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
    if (newStage.position === 15) {
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

  async getSubmissions(id: string, user: any) {
    return this.opportunitiesRepository.manager.query(
      `SELECT fs.status, fs.submitted_at, f.code as form_code, fs.raw_payload_json 
       FROM form_submissions fs
       JOIN forms f ON fs.form_id = f.id
       WHERE fs.opportunity_id = $1 AND fs.company_id = $2
       ORDER BY fs.submitted_at ASC`,
      [id, user.companyId]
    );
  }
}
