import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { OpportunityStageHistory } from '../../database/entities/opportunity-stage-history.entity';
import { PipelineStage } from '../../database/entities/pipeline-stage.entity';
import { Torre } from '../../database/entities/torre.entity';
import { Piso } from '../../database/entities/piso.entity';
import { Predio } from '../../database/entities/predio.entity';
import { Distrito } from '../../database/entities/distrito.entity';
import { FormSubmission } from '../../database/entities/form-submission.entity';

const parseBackendDate = (val: string) => {
  if (!val || val === '-') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return new Date(val);
  const match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const d = parseInt(match[1], 10);
    const m = parseInt(match[2], 10) - 1;
    const y = parseInt(match[3], 10);
    return new Date(y, m, d);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

@Injectable()
export class HuntingService {
  constructor(
    @InjectRepository(Opportunity) private readonly opportunitiesRepository: Repository<Opportunity>,
    @InjectQueue('report-generation') private readonly reportQueue: Queue
  ) {}

  
  async createHuntingOpportunity(user: any, dto: any, manager: EntityManager) {
    const opp = manager.create(Opportunity, {
      companyId: user.companyId,
      createdByUserId: user.id,
      currentOwnerUserId: user.id,
      status: 'OPEN'
    });
    const predio = manager.create(Predio, {
      nombreProyecto: dto.nombreProyecto || '-',
      tipoVia: dto.tipoVia || '-',
      nombreVia: dto.nombreVia || '-',
      canalHunting: dto.canalHunting || 'FUTURA',
      companyId: user.companyId,
    });
    await manager.save(predio);
    opp.propertyId = predio.id;
    await manager.save(opp);
    return opp;
  }

  async findAllHunting(user: any) {
    let whereClause: any = {};
    const isAgencyAdmin = user.globalRole === 'AGENCY_ADMIN' || user.role === 'AGENCY_ADMIN';

    if (isAgencyAdmin) {
      if (user.companyId) {
        whereClause = { companyId: user.companyId };
      } else {
        whereClause = {};
      }
    } else if (user.role === 'HUNTER' || user.role === 'ASESOR_VENTAS') {
      whereClause = [
        { companyId: user.companyId, createdByUserId: user.id },
        { companyId: user.companyId, currentOwnerUserId: user.id }
      ];
    } else {
      whereClause = { companyId: user.companyId };
    }

    const opps = await this.opportunitiesRepository.find({
      where: whereClause,
      relations: {
        currentStage: true,
        company: true,
        property: {
          distrito: true,
          hunterPrincipal: true,
          torres: { pisos: true }
        },
        currentOwnerUser: true,
      }
    });

    // Solo retornamos las que SÍ tienen property (son de hunting)
    const huntingOpps = opps.filter(o => o.propertyId != null);

    return huntingOpps.map(o => {
      return {
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
      };
    });
  }

  async updateHuntingOpportunity(id: string, user: any, dto: any, manager: EntityManager) {
    const whereClause: any = { id };
    const isAgencyAdmin = user.globalRole === 'AGENCY_ADMIN' || user.role === 'AGENCY_ADMIN';
    if (!isAgencyAdmin) {
      whereClause.companyId = user.companyId;
    }

    const opp: Opportunity | null = await manager.findOne(Opportunity, {
      where: whereClause,
      relations: { property: true },
    });
    
    if (!opp) throw new NotFoundException('Oportunidad de Hunting no encontrada.');
    if (!opp.property) throw new BadRequestException('Esta oportunidad no es de tipo Hunting (no tiene predio).');

    const predio = opp.property;

    if (dto) {
      if (dto.nombreProyecto && dto.nombreProyecto !== '-') predio.nombreProyecto = dto.nombreProyecto;
      if (dto.tipoVia && dto.tipoVia !== '-') predio.tipoVia = dto.tipoVia;
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
      if (dto.numeracionesVia && dto.numeracionesVia !== '-') predio.numeracionMunicipal = dto.numeracionesVia;
      if (dto.numeracionVia && dto.numeracionVia !== '-') predio.numeracionMunicipal = dto.numeracionVia;
      
      if (dto.fechaEntrega && dto.fechaEntrega !== '-') {
        const parsed = parseBackendDate(dto.fechaEntrega);
        if (parsed) predio.fechaEntrega = parsed;
      }
      if (dto.fechaMontantes && dto.fechaMontantes !== '-') {
        const parsed = parseBackendDate(dto.fechaMontantes);
        if (parsed) predio.terminoMontantes = parsed;
      }
      if (dto.fechaMecha && dto.fechaMecha !== '-') {
        const parsed = parseBackendDate(dto.fechaMecha);
        if (parsed) predio.terminoMecha = parsed;
      }

      if (dto.horarioVisita && dto.horarioVisita !== '-') predio.horarioVisita = dto.horarioVisita;
      if (dto.urbanizacionZona && dto.urbanizacionZona !== '-') predio.urbanizacionZona = dto.urbanizacionZona;
      if (dto.urbanizacion && dto.urbanizacion !== '-') predio.urbanizacionZona = dto.urbanizacion;
      if (dto.departamento && dto.departamento !== '-') predio.departamento = dto.departamento;
      if (dto.provincia && dto.provincia !== '-') predio.provincia = dto.provincia;
      if (dto.codigoPostal && dto.codigoPostal !== '-') predio.codigoPostal = dto.codigoPostal;
      if (dto.clientesInteresados && dto.clientesInteresados !== '-') predio.clientesInteresados = parseInt(dto.clientesInteresados, 10) || 0;

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

      if (dto.numeroHPs && dto.numeroHPs !== '-') predio.totalHogares = parseInt(dto.numeroHPs, 10) || predio.totalHogares;
      if (dto.totalHogares && dto.totalHogares !== '-') predio.totalHogares = parseInt(dto.totalHogares, 10) || predio.totalHogares;
      if (dto.totalTorres && dto.totalTorres !== '-') {
        predio.totalTorres = parseInt(dto.totalTorres, 10) || predio.totalTorres;
        predio.clasificacionProyecto = predio.totalTorres <= 2 ? 'EDIFICIO' : 'CONDOMINIO';
      }

      if (dto.tipoEdificio && dto.tipoEdificio !== '-') predio.clasificacionProyecto = dto.tipoEdificio;
      if (dto.tipoProyecto && dto.tipoProyecto !== '-') predio.tipoDesarrollo = dto.tipoProyecto;
      
      const estrenoVal = dto.estreno || dto.edificioEstreno || dto.esEstreno || dto.estadoConstruccion || dto.tipoConstruccion;
      if (predio.estadoConstruccion !== 'SI') {
         if (estrenoVal && estrenoVal !== '-') {
           predio.estadoConstruccion = estrenoVal;
         }
      } else if (predio.estadoConstruccion === 'SI') {
         predio.estadoConstruccion = 'ESTRENO';
      }
      if (dto.juntaDirectiva && dto.juntaDirectiva !== '-') predio.juntaDirectiva = dto.juntaDirectiva;
      if (dto.visitaInspeccion && dto.visitaInspeccion !== '-') {
        const parsed = parseBackendDate(dto.visitaInspeccion);
        if (parsed) predio.fechaVisitaTecnica = parsed;
      }

      if (dto.inmobiliaria && dto.inmobiliaria !== '-') predio.inmobiliaria = dto.inmobiliaria;
      if (dto.nombreResponsable && dto.nombreResponsable !== '-') predio.nombreResponsable = dto.nombreResponsable;
      if (dto.telefonoResponsable && dto.telefonoResponsable !== '-') predio.telefonoResponsable = dto.telefonoResponsable;
      if (dto.cargoResponsable && dto.cargoResponsable !== '-') predio.cargoResponsable = dto.cargoResponsable;
      if (dto.correoResponsable && dto.correoResponsable !== '-') predio.correoResponsable = dto.correoResponsable;
      if (dto.ingreso && dto.ingreso !== '-') predio.ingreso = dto.ingreso;

      if (dto.currentOwnerUserId && dto.currentOwnerUserId !== '-') {
        let userId = dto.currentOwnerUserId.trim();
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(userId);
        if (!isUuid) {
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

      if (dto.companyId && dto.companyId !== '-') {
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(dto.companyId);
        if (isUuid) {
          opp.companyId = dto.companyId;
          predio.companyId = dto.companyId;
        }
      }

      await manager.save(Predio, predio);

      if (dto.towersData) {
        await manager.delete(Torre, { predioId: predio.id });
        let calculatedTotalHogares = 0;
        for (const towerInfo of dto.towersData) {
          const torre = manager.create(Torre, {
            predioId: predio.id,
            nombreTorre: towerInfo.nombre_torre || 'Torre Sin Nombre'
          });
          const savedTorre: Torre = await manager.save(Torre, torre);
          
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
      
      if (dto.nombreCanal && dto.nombreCanal !== '-') opp.canalHunting = dto.nombreCanal;
      if (dto.canalHunting && dto.canalHunting !== '-') opp.canalHunting = dto.canalHunting;

      if (Object.keys(dto).length > 0) {
        let formCode = dto._formType || 'FORM_ACTUALIZACION';
        if (formCode === 'FORM_ACTUALIZACION') {
          if (dto.asignarF2 || dto.ingresoF2) formCode = 'FORM_ASIGNACION';
          else if (dto.visitaInspeccionF3 || dto.horarioVisitaF3) formCode = 'FORM_FICHA_DATOS';
        }
        const submission = manager.create(FormSubmission, {
          opportunityId: opp.id,
          formCode,
          submittedByUserId: user.id,
          rawPayloadJson: dto,
        });
        await manager.save(submission);
      }
    }

    opp.lastActivityAt = new Date();
    await manager.save(opp);
    return opp;
  }

  async transitionHuntingStage(id: string, user: any, dto: any, manager: EntityManager) {
    const HUNTER_ALLOWED_TRANSITIONS: Record<number, number[]> = {
      4: [5],
      12: [13],
    };

    const whereClause: any = { id };
    const isAgencyAdmin = user.globalRole === 'AGENCY_ADMIN' || user.role === 'AGENCY_ADMIN';
    if (!isAgencyAdmin) {
      whereClause.companyId = user.companyId;
    }

    const opportunity = await manager.findOne(Opportunity, { where: whereClause });
    if (!opportunity) throw new NotFoundException('Oportunidad no encontrada');
    if (!opportunity.propertyId) throw new BadRequestException('Esta oportunidad no es de tipo Hunting.');

    const currentStage = await manager.findOne(PipelineStage, { where: { id: opportunity.currentStageId } });
    if (!currentStage) throw new NotFoundException('Etapa actual no encontrada');

    let newStage: PipelineStage | null = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(dto.toStageIdOrCode);

    if (isUuid) {
      newStage = await manager.findOne(PipelineStage, { where: { id: dto.toStageIdOrCode, pipelineId: opportunity.pipelineId } });
    } else {
      newStage = await manager.findOne(PipelineStage, { where: { code: dto.toStageIdOrCode, pipelineId: opportunity.pipelineId } });
      if (!newStage && /^S\d+$/i.test(dto.toStageIdOrCode)) {
        newStage = await manager.createQueryBuilder(PipelineStage, 'ps')
          .where('ps.pipelineId = :pipelineId', { pipelineId: opportunity.pipelineId })
          .andWhere('ps.code LIKE :suffix', { suffix: `%-${dto.toStageIdOrCode.toUpperCase()}` })
          .getOne();
      }
    }

    if (!newStage) throw new BadRequestException('La etapa destino no es válida para este pipeline.');
    if (opportunity.currentStageId === newStage.id) throw new BadRequestException('La oportunidad ya se encuentra en esta etapa.');

    if (user.role === 'HUNTER') {
      const allowed = HUNTER_ALLOWED_TRANSITIONS[currentStage.position];
      if (!allowed || !allowed.includes(newStage.position)) {
        throw new BadRequestException(`Hunters solo pueden completar los formularios asignados (etapa ${currentStage.position} → ${newStage.position} no permitida).`);
      }
    }

    const isBOOrAdmin = user.role === 'BACKOFFICE' || user.role === 'ACCOUNT_ADMIN' || user.role === 'ADMIN' || user.role === 'AGENCY_ADMIN' || user.globalRole === 'AGENCY_ADMIN';
    if (isBOOrAdmin) {
      if (newStage.code === 'S7') {
        if (!dto.isValidatedByBO) throw new BadRequestException('Esta etapa requiere validación explícita mediante el botón "Revisado".');
      }
    }

    if (newStage.isLost && !dto.reason) throw new BadRequestException('Debe indicar un motivo de pérdida.');

    const previousStageId = opportunity.currentStageId;
    opportunity.currentStageId = newStage.id;
    opportunity.currentStageEnteredAt = new Date();
    opportunity.lastActivityAt = new Date();

    if (newStage.isWon) {
      opportunity.status = 'WON';
      opportunity.wonAt = new Date();
    } else if (newStage.isLost) {
      opportunity.status = 'LOST';
      opportunity.lostAt = new Date();
      if (dto.reason) opportunity.motivoCierre = dto.reason;
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

    if (dto.towersData && opportunity.propertyId) {
      await manager.delete(Torre, { predioId: opportunity.propertyId });
      let calculatedTotalHogares = 0;
      for (const towerInfo of dto.towersData) {
        const torre = manager.create(Torre, { predioId: opportunity.propertyId, nombreTorre: towerInfo.nombre_torre || 'Torre Sin Nombre' });
        const savedTorre: Torre = await manager.save(Torre, torre);
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
          const piso = manager.create(Piso, { torreId: savedTorre.id, numeroPiso: i, hogaresCantidad: hogares });
          await manager.save(piso);
        }
      }
      await manager.update(Predio, opportunity.propertyId, { totalTorres: dto.towersData.length, totalHogares: calculatedTotalHogares });
    }

    const automaticTransitions: Record<string, string> = {
      'S2': 'S4', 'S5': 'S6', 'S9': 'S12', 'S13': 'S14'
    };
    if (newStage.code === 'S7') await this.reportQueue.add('send-win-request', { opportunityId: opportunity.id });
    if (automaticTransitions[newStage.code]) {
      const nextCode = automaticTransitions[newStage.code];
      setTimeout(() => {
        this.executeAutomaticTransition(opportunity.id, nextCode);
      }, 5000);
    }
    return opportunity;
  }

  async executeAutomaticTransition(opportunityId: string, toCode: string) {
    const manager = this.opportunitiesRepository.manager;
    try {
      const opportunity = await manager.findOne(Opportunity, { where: { id: opportunityId } });
      if (!opportunity) return;
      const newStage: PipelineStage | null = await manager.findOne(PipelineStage, { where: { code: toCode, pipelineId: opportunity.pipelineId } });
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
        changedByUserId: opportunity.createdByUserId,
        reason: 'Transición automática del sistema'
      });
      await manager.save(history);
    } catch (e) {
      console.error('Error en transición automática:', e);
    }
  }
}
