import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EntityManager, Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVentaFijaDto } from '../dto/create-venta-fija.dto';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { VentaFija } from '../../database/entities/venta-fija.entity';
import { Pipeline } from '../../database/entities/pipeline.entity';
import { PipelineStage } from '../../database/entities/pipeline-stage.entity';
import { LeadSource } from '../../database/entities/lead-source.entity';
import { FormSubmission } from '../../database/entities/form-submission.entity';
import { OpportunityStageHistory } from '../../database/entities/opportunity-stage-history.entity';
import { Team } from '../../database/entities/team.entity';
import { UserCompany } from '../../database/entities/user-company.entity';

@Injectable()
export class VentaFijaService {
  constructor(
    @InjectRepository(Opportunity) private readonly opportunitiesRepository: Repository<Opportunity>,
    @InjectQueue('report-generation') private readonly reportQueue: Queue
  ) {}

  async createVentaFija(user: any, dto: CreateVentaFijaDto, manager: EntityManager) {
    const isAgencyAdmin = user.globalRole === 'AGENCY_ADMIN' || user.role === 'AGENCY_ADMIN';
    const isBOOrAdmin = isAgencyAdmin || user.role === 'ACCOUNT_ADMIN' || user.role === 'ADMIN' || user.role === 'BACKOFFICE' || user.role === 'BACKOFFICE_VENTAS' || user.role === 'POSTVENTA';
    
    const assignedCompanyId = isBOOrAdmin && dto.companyId ? dto.companyId : user.companyId;
    if (!assignedCompanyId) throw new BadRequestException('El companyId es requerido.');

    const pipeline: Pipeline | null = await manager.findOne(Pipeline, { where: { isActive: true, companyId: assignedCompanyId } });
    if (!pipeline) throw new BadRequestException('No existe un pipeline configurado para tu empresa.');
    
    let targetStage: PipelineStage | null = null;
    if (isBOOrAdmin) {
      const codeToSearch = dto.initialStageCode || 'S4';
      targetStage = await manager.findOne(PipelineStage, { where: { pipelineId: pipeline.id, code: codeToSearch } });
      if (!targetStage && /^S\d+$/i.test(codeToSearch)) {
        targetStage = await manager.createQueryBuilder(PipelineStage, 'ps')
          .where('ps.pipelineId = :pipelineId', { pipelineId: pipeline.id })
          .andWhere('ps.code LIKE :suffix', { suffix: `%-${codeToSearch.toUpperCase()}` })
          .getOne();
      }
    }

    if (!targetStage) targetStage = await manager.findOne(PipelineStage, { where: { pipelineId: pipeline.id, isInitial: true } });
    if (!targetStage) throw new BadRequestException('El pipeline no tiene una etapa inicial configurada.');

    let leadSource: LeadSource | null = await manager.findOne(LeadSource, { where: { name: 'Scraping' } });
    if (!leadSource) {
      leadSource = manager.create(LeadSource, { id: '00000000-0000-0000-0000-000000000002', name: 'Scraping', code: 'SCR' });
      await manager.save(leadSource);
    }

    const opportunity = manager.create(Opportunity, {
      code: `OPP-${Date.now().toString().slice(-6)}`,
      companyId: assignedCompanyId,
      propertyId: null,
      createdByUserId: user.id,
      currentOwnerUserId: user.id,
      status: 'OPEN',
      leadSourceId: leadSource.id,
      currentStageId: targetStage.id,
      pipelineId: pipeline.id,
      currentStageEnteredAt: new Date(),
    });
    const savedOpportunity = await manager.save(opportunity);

    let coords: { x: number; y: number } | null = null;
    if (dto.coordenadas) {
      const parts = dto.coordenadas.split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        coords = { x: parts[0], y: parts[1] };
      }
    }

    const venta = manager.create(VentaFija, {
      opportunityId: savedOpportunity.id,
      ruc: dto.ruc,
      razonSocial: dto.razonSocial,
      representanteLegal: dto.representanteLegal,
      dniRrll: dto.dniRrll,
      celularRrll: dto.celularRrll,
      correoElectronico: dto.correoElectronico,
      nombrePadresRrll: dto.nombrePadresRrll,
      fechaNacimientoRrll: dto.fechaNacimientoRrll,
      lugarNacimientoRrll: dto.lugarNacimientoRrll,
      tipoDomicilio: dto.tipoDomicilio,
      direccionFiscal: dto.direccionFiscal,
      direccionInstalacion: dto.direccionInstalacion,
      departamento: dto.departamento,
      provincia: dto.provincia,
      distrito: dto.distrito,
      referencia: dto.referencia,
      coordenadasGps: coords,
      tipoTecnologia: dto.tipoTecnologia,
      tipoPlay: dto.tipoPlay,
      velocidad: dto.velocidad,
      cargoFijoSinIgv: typeof dto.cargoFijoSinIgv === 'string' ? parseFloat(dto.cargoFijoSinIgv) : dto.cargoFijoSinIgv,
      campana: dto.campana,
      adicionales: dto.adicionales,
      tipoServicio: dto.tipoServicio,
      cantidadLineas: typeof dto.cantidadLineas === 'string' && dto.cantidadLineas.trim() !== '' ? parseInt(dto.cantidadLineas) : (typeof dto.cantidadLineas === 'number' && !isNaN(dto.cantidadLineas) ? dto.cantidadLineas : undefined),
      tipoMovil: dto.tipoMovil,
      observaciones: dto.observaciones,
      planoUrl: dto.planoUrl,
    });
    const savedVenta = await manager.save(venta);

    const submission = manager.create(FormSubmission, {
      opportunityId: savedOpportunity.id,
      formCode: 'FORM_REGISTRO_INICIAL',
      submittedByUserId: user.id,
      rawPayloadJson: dto,
    });
    await manager.save(submission);

    return {
      success: true,
      opportunityId: savedOpportunity.id,
      ventaId: savedVenta.id,
    };
  }

  async findAllVentas(user: any) {
    let opps: Opportunity[] = [];
    const manager = this.opportunitiesRepository.manager;
    let whereClause: any = {};
    const isAgencyAdmin = user.globalRole === 'AGENCY_ADMIN' || user.role === 'AGENCY_ADMIN';

    if (isAgencyAdmin || user.role === 'ACCOUNT_ADMIN' || user.role === 'ADMIN' || user.role === 'BACKOFFICE' || user.role === 'BACKOFFICE_VENTAS') {
      whereClause = user.companyId ? { companyId: user.companyId } : {};
    } else if (user.role === 'SUPERVISOR_VENTAS') {
      const team = await manager.findOne(Team, { where: { supervisorId: user.id, companyId: user.companyId } });
      const userIds = [user.id]; // Siempre puede ver sus propias oportunidades

      if (team) {
        const userCompanies = await manager.find(UserCompany, { where: { teamId: team.id } });
        const teamUserIds = userCompanies.map(uc => uc.userId);
        userIds.push(...teamUserIds);
      }

      whereClause = [
        { companyId: user.companyId, createdByUserId: In(userIds) },
        { companyId: user.companyId, currentOwnerUserId: In(userIds) }
      ];
    } else if (user.role === 'HUNTER' || user.role === 'ASESOR_VENTAS') {
      whereClause = [
        { companyId: user.companyId, createdByUserId: user.id },
        { companyId: user.companyId, currentOwnerUserId: user.id }
      ];
    } else if (user.role === 'POSTVENTA') {
      // Postventa will be filtered post-query by stage, but can query their own company
      whereClause = { companyId: user.companyId };
    } else {
      whereClause = { companyId: user.companyId };
    }

    opps = await this.opportunitiesRepository.find({
      where: whereClause,
      relations: {
        currentStage: true,
        company: true,
        currentOwnerUser: true,
        ventaFija: true,
      }
    });

    if (user.role === 'POSTVENTA') {
      opps = opps.filter(o => (o.currentStage && o.currentStage.position >= 15) || o.currentOwnerUserId === user.id);
    }

    const ventaOpps = opps.filter(o => o.propertyId == null && (o.ventaFija != null || o.company?.tipoNegocio === 'VENTAS_B2B'));

    return ventaOpps.map(o => {
      return {
        ...o,
        id: o.id,
        title: o.ventaFija?.razonSocial || `Venta: ${o.code}`,
        subtitle: o.ventaFija?.direccionInstalacion || 'Dirección no registrada',
        stage: o.currentStage ? (o.currentStage.position - 1) : (o.status === 'OPEN' ? 0 : (o.status === 'WON' ? 18 : 19)),
        property: {
          distrito: o.ventaFija?.distrito || '-',
          ejecutivo: o.currentOwnerUser?.fullName || 'Asesor',
          totalHogares: o.ventaFija?.cargoFijoSinIgv || 0,
          direccionExacta: o.ventaFija?.direccionInstalacion || '-',
          nombreProyecto: o.ventaFija?.razonSocial || '-',
          tipoTecnologia: o.ventaFija?.tipoTecnologia || '-',
          tipoPlay: o.ventaFija?.tipoPlay || '-',
        },
        data: o
      };
    });
  }

  async updateVentaOpportunity(id: string, user: any, dto: any, manager: EntityManager) {
    const whereClause: any = { id };
    const isAgencyAdmin = user.globalRole === 'AGENCY_ADMIN' || user.role === 'AGENCY_ADMIN';
    if (!isAgencyAdmin) {
      whereClause.companyId = user.companyId;
    }

    const opp: Opportunity | null = await manager.findOne(Opportunity, {
      where: whereClause,
      relations: { ventaFija: true },
    });
    if (!opp) throw new NotFoundException('Oportunidad de Venta no encontrada.');
    if (!opp.ventaFija) throw new BadRequestException('Esta oportunidad no es de tipo VentaFija.');

    if (dto.notasPostventa !== undefined) opp.ventaFija.notasPostventa = dto.notasPostventa;
    if (dto.ruc !== undefined) opp.ventaFija.ruc = dto.ruc;
    if (dto.razonSocial !== undefined) opp.ventaFija.razonSocial = dto.razonSocial;
    if (dto.representanteLegal !== undefined) opp.ventaFija.representanteLegal = dto.representanteLegal;
    if (dto.dniRrll !== undefined) opp.ventaFija.dniRrll = dto.dniRrll;
    if (dto.celularRrll !== undefined) opp.ventaFija.celularRrll = dto.celularRrll;
    if (dto.correoElectronico !== undefined) opp.ventaFija.correoElectronico = dto.correoElectronico;
    if (dto.nombrePadresRrll !== undefined) opp.ventaFija.nombrePadresRrll = dto.nombrePadresRrll;
    if (dto.fechaNacimientoRrll !== undefined) opp.ventaFija.fechaNacimientoRrll = dto.fechaNacimientoRrll;
    if (dto.lugarNacimientoRrll !== undefined) opp.ventaFija.lugarNacimientoRrll = dto.lugarNacimientoRrll;
    if (dto.tipoDomicilio !== undefined) opp.ventaFija.tipoDomicilio = dto.tipoDomicilio;
    if (dto.direccionFiscal !== undefined) opp.ventaFija.direccionFiscal = dto.direccionFiscal;
    if (dto.direccionInstalacion !== undefined) opp.ventaFija.direccionInstalacion = dto.direccionInstalacion;
    if (dto.departamento !== undefined) opp.ventaFija.departamento = dto.departamento;
    if (dto.provincia !== undefined) opp.ventaFija.provincia = dto.provincia;
    if (dto.distrito !== undefined) opp.ventaFija.distrito = dto.distrito;
    if (dto.referencia !== undefined) opp.ventaFija.referencia = dto.referencia;
    if (dto.tipoTecnologia !== undefined) opp.ventaFija.tipoTecnologia = dto.tipoTecnologia;
    if (dto.tipoPlay !== undefined) opp.ventaFija.tipoPlay = dto.tipoPlay;
    if (dto.velocidad !== undefined) opp.ventaFija.velocidad = dto.velocidad;
    if (dto.cargoFijoSinIgv !== undefined) {
      opp.ventaFija.cargoFijoSinIgv = typeof dto.cargoFijoSinIgv === 'string' ? parseFloat(dto.cargoFijoSinIgv) : dto.cargoFijoSinIgv;
    }
    if (dto.campana !== undefined) opp.ventaFija.campana = dto.campana;
    if (dto.adicionales !== undefined) opp.ventaFija.adicionales = dto.adicionales;
    if (dto.tipoServicio !== undefined) opp.ventaFija.tipoServicio = dto.tipoServicio;
    if (dto.cantidadLineas !== undefined) {
      opp.ventaFija.cantidadLineas = typeof dto.cantidadLineas === 'string' ? parseInt(dto.cantidadLineas, 10) : dto.cantidadLineas;
    }
    if (dto.tipoMovil !== undefined) opp.ventaFija.tipoMovil = dto.tipoMovil;
    if (dto.observaciones !== undefined) opp.ventaFija.observaciones = dto.observaciones;

    await manager.save(opp.ventaFija);

    if (Object.keys(dto).length > 0) {
      let formCode = dto._formType || 'FORM_ACTUALIZACION_VENTA';
      const submission = manager.create(FormSubmission, {
        opportunityId: opp.id,
        formCode,
        submittedByUserId: user.id,
        rawPayloadJson: dto,
      });
      await manager.save(submission);
    }

    opp.lastActivityAt = new Date();
    await manager.save(opp);
    return opp;
  }

  async transitionVentaStage(id: string, user: any, dto: any, manager: EntityManager) {
    const whereClause: any = { id };
    const isAgencyAdmin = user.globalRole === 'AGENCY_ADMIN' || user.role === 'AGENCY_ADMIN';
    if (!isAgencyAdmin) {
      whereClause.companyId = user.companyId;
    }

    const opportunity = await manager.findOne(Opportunity, { where: whereClause });
    if (!opportunity) throw new NotFoundException('Oportunidad no encontrada');
    if (opportunity.propertyId != null) throw new BadRequestException('Esta oportunidad no es de tipo Venta.');

    const currentStage: PipelineStage | null = await manager.findOne(PipelineStage, { where: { id: opportunity.currentStageId } });
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

    const position = newStage.position - 1; // Ajuste si newStage.position es 1-indexed y tu matriz es 0-indexed
    const isVendedor = user.role === 'ASESOR_VENTAS' || user.role === 'HUNTER';
    const isSupervisor = user.role === 'SUPERVISOR_VENTAS';
    const isPostventa = user.role === 'POSTVENTA';
    const isBO = user.role === 'BACKOFFICE' || user.role === 'BACKOFFICE_VENTAS';
    const isAdmin = user.role === 'ACCOUNT_ADMIN' || user.role === 'ADMIN' || user.role === 'AGENCY_ADMIN' || user.globalRole === 'AGENCY_ADMIN';

    const authMatrix: Record<number, string[]> = {
      0: ['Vendedor', 'Supervisor', 'BO', 'Admin'],
      1: ['Supervisor', 'BO', 'Admin'],
      2: ['Vendedor', 'Supervisor', 'BO', 'Admin'],
      3: ['BO', 'Admin'],
      4: ['Vendedor', 'Supervisor', 'BO', 'Admin'],
      5: ['Vendedor', 'Supervisor', 'BO', 'Admin'],
      6: ['BO', 'Admin'],
      7: ['BO', 'Admin'],
      8: ['BO', 'Admin'],
      9: ['BO', 'Admin'],
      10: ['BO', 'Admin'],
      11: ['BO', 'Admin'],
      12: ['Supervisor', 'BO', 'Admin'],
      13: ['BO', 'Admin'],
      14: ['BO', 'Admin'],
      15: ['Postventa', 'BO', 'Admin'],
      16: ['Postventa', 'BO', 'Admin'],
      17: ['Postventa', 'BO', 'Admin'],
      18: ['Postventa', 'BO', 'Admin'],
      19: ['Postventa', 'BO', 'Admin'],
      20: ['Postventa', 'BO', 'Admin'],
    };

    const allowedRoles = authMatrix[position] || [];
    let authorized = false;
    if (isVendedor && allowedRoles.includes('Vendedor')) authorized = true;
    if (isSupervisor && allowedRoles.includes('Supervisor')) authorized = true;
    if (isPostventa && allowedRoles.includes('Postventa')) authorized = true;
    if (isBO && allowedRoles.includes('BO')) authorized = true;
    if (isAdmin && allowedRoles.includes('Admin')) authorized = true;

    if (!authorized) {
      throw new ForbiddenException(`Tu rol (${user.role}) no tiene permisos para mover la oportunidad a esta etapa.`);
    }

    const isBOOrAdmin = user.role === 'BACKOFFICE' || user.role === 'BACKOFFICE_VENTAS' || user.role === 'POSTVENTA' || user.role === 'SUPERVISOR_VENTAS' || user.role === 'ACCOUNT_ADMIN' || user.role === 'ADMIN' || user.role === 'AGENCY_ADMIN' || user.globalRole === 'AGENCY_ADMIN';
    if (isBOOrAdmin) {
      if (newStage.code === 'S7' || newStage.code === 'S15') {
        if (!dto.isValidatedByBO) throw new BadRequestException('Esta etapa requiere validación explícita mediante el botón "Revisado".');
      }
    }

    if (newStage.isLost && newStage.position >= 15 && !dto.reason) throw new BadRequestException('Debe indicar un motivo para dar de baja al cliente.');

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

    const automaticTransitions: Record<string, string> = {
      'S2': 'S4', 'S5': 'S6', 'S9': 'S12', 'S13': 'S14'
    };

    if (newStage.code === 'S7') await this.reportQueue.add('send-win-request', { opportunityId: opportunity.id });
    if (newStage.code === 'S15') await this.reportQueue.add('generate-excel', { opportunityId: opportunity.id });

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
