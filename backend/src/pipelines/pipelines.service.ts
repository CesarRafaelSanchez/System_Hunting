import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Pipeline } from '../database/entities/pipeline.entity';
import { PipelineStage } from '../database/entities/pipeline-stage.entity';
import { Opportunity } from '../database/entities/opportunity.entity';
import { CreatePipelineDto, UpdatePipelineDto, PipelineStageDto } from './dto/create-pipeline.dto';

@Injectable()
export class PipelinesService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getActivePipeline(companyId: string, manager?: EntityManager) {
    const mgr = manager || this.dataSource.manager;
    
    // First try to find pipeline for this specific company
    let pipeline = await mgr.findOne(Pipeline, {
      where: { isActive: true, companyId }
    });

    // Fallback for backwards compatibility with global pipeline
    if (!pipeline) {
      pipeline = await mgr.findOne(Pipeline, {
        where: { isActive: true, companyId: null as any }
      });
    }

    if (!pipeline) {
      // Crear pipeline por defecto automáticamente
      const defaultPipeline = mgr.create(Pipeline, {
        name: 'Pipeline Comercial Principal',
        code: `PCP-${companyId || 'GLOBAL'}`,
        description: 'Pipeline comercial por defecto autogenerado por el sistema.',
        isActive: true,
        companyId: companyId
      });
      const savedPipeline = await mgr.save(defaultPipeline);

      const OFFICIAL_STAGES = [
        'Edificio Prospectado',
        'Prospecto Aceptado / Trabajable',
        'Prospecto Rechazado / No Trabajable',
        'Pendiente Envío de Formulario de Asignación',
        'Formulario de Asignación/Reasignación Completado',
        'Validación Back Office',
        'Solicitud de Asignación/Reasignación Enviada a WIN',
        'Esperando Respuesta WIN',
        'Asignación Aprobada',
        'Asignación Rechazada',
        'Pendiente Reasignación',
        'Pendiente Envío de Formulario Ficha de Datos',
        'Formulario de Ficha de Datos Completado',
        'Validación Back Office 2',
        'Ficha de Datos Enviada a WIN',
        'Pendiente Inicio de Habilitación (construcción)',
        'En Habilitación Técnica',
        'Standby por Accesos',
        'Habilitación Completa',
        'Hunting Perdido/ No Recuperable'
      ];

      const stages = OFFICIAL_STAGES.map((stageName, i) => {
        const position = i + 1;
        let stageType = 'STANDARD';
        let isWon = false;
        let isLost = false;
        let isFinal = false;

        if (stageName === 'Habilitación Completa') {
          stageType = 'WON';
          isWon = true;
          isFinal = true;
        } else if (stageName === 'Hunting Perdido/ No Recuperable' || stageName === 'Prospecto Rechazado / No Trabajable') {
          stageType = 'LOST';
          isLost = true;
          isFinal = true;
        }

        return mgr.create(PipelineStage, {
          pipelineId: savedPipeline.id,
          name: stageName,
          code: `S${position}`,
          position,
          isInitial: position === 1,
          isWon,
          isLost,
          isFinal,
          stageType
        });
      });

      await mgr.save(stages);
      pipeline = savedPipeline;
    }

    const stages = await mgr.find(PipelineStage, {
      where: { pipelineId: pipeline.id },
      order: { position: 'ASC' }
    });

    return {
      ...pipeline,
      stages
    };
  }

  private validateStages(stages: PipelineStageDto[]) {
    const initials = stages.filter(s => s.isInitial);
    const wons = stages.filter(s => s.isWon);
    const losts = stages.filter(s => s.isLost);

    if (initials.length !== 1) {
      throw new BadRequestException('Debe haber exactamente una etapa marcada como Inicial.');
    }
    if (wons.length !== 1) {
      throw new BadRequestException('Debe haber exactamente una etapa marcada como Ganada.');
    }
    if (losts.length < 1) {
      throw new BadRequestException('Debe haber al menos una etapa marcada como Perdida.');
    }
  }

  async createPipeline(dto: CreatePipelineDto, companyId: string, manager?: EntityManager) {
    const mgr = manager || this.dataSource.manager;
    this.validateStages(dto.stages);

    // Desactivar cualquier pipeline activo existente
    await mgr.update(Pipeline, { isActive: true, companyId }, { isActive: false });

    // Crear nuevo pipeline
    const pipeline = mgr.create(Pipeline, {
      name: dto.name,
      code: dto.code,
      description: dto.description,
      isActive: true,
      companyId: companyId
    });
    const savedPipeline = await mgr.save(pipeline);

    // Crear etapas
    const stages = dto.stages.map((s, index) => {
      return mgr.create(PipelineStage, {
        pipelineId: savedPipeline.id,
        name: s.name,
        code: s.code,
        position: index + 1,
        stageType: s.stageType,
        isInitial: !!s.isInitial,
        isFinal: !!s.isFinal || !!s.isWon || !!s.isLost,
        isWon: !!s.isWon,
        isLost: !!s.isLost
      });
    });

    await mgr.save(stages);

    return this.getActivePipeline(companyId, mgr);
  }

  async updatePipeline(id: string, dto: UpdatePipelineDto, companyId: string, manager?: EntityManager) {
    const mgr = manager || this.dataSource.manager;
    this.validateStages(dto.stages);

    const pipeline = await mgr.findOne(Pipeline, { where: { id, companyId } });
    if (!pipeline) {
      throw new NotFoundException('Pipeline no encontrado');
    }

    // Actualizar metadatos del pipeline
    pipeline.name = dto.name;
    pipeline.code = dto.code;
    pipeline.description = dto.description || '';
    await mgr.save(pipeline);

    // Obtener etapas actuales en la base de datos
    const currentStages = await mgr.find(PipelineStage, { where: { pipelineId: id } });

    // Identificar etapas eliminadas (las que están en DB pero no vienen en el DTO)
    const incomingIds = dto.stages.map(s => s.id).filter(Boolean);
    const deletedStages = currentStages.filter(s => !incomingIds.includes(s.id));

    // Validar que no se estén eliminando etapas que ya tienen oportunidades
    for (const ds of deletedStages) {
      const hasOpps = await mgr.findOne(Opportunity, { where: { currentStageId: ds.id } });
      if (hasOpps) {
        throw new BadRequestException(`No se puede eliminar la etapa "${ds.name}" porque tiene oportunidades (Leads) asociadas.`);
      }
    }

    if (deletedStages.length > 0) {
      await mgr.remove(deletedStages);
    }

    // Actualizar/Crear etapas
    const updatedStages = dto.stages.map((s, index) => {
      // Si tiene ID y existe en DB, actualizamos
      const existingStage = currentStages.find(cs => cs.id === s.id);
      
      if (existingStage) {
        existingStage.name = s.name;
        existingStage.code = s.code;
        existingStage.position = index + 1;
        existingStage.stageType = s.stageType;
        existingStage.isInitial = !!s.isInitial;
        existingStage.isFinal = !!s.isFinal || !!s.isWon || !!s.isLost;
        existingStage.isWon = !!s.isWon;
        existingStage.isLost = !!s.isLost;
        return existingStage;
      } else {
        // Es nueva etapa
        return mgr.create(PipelineStage, {
          pipelineId: pipeline.id,
          name: s.name,
          code: s.code,
          position: index + 1,
          stageType: s.stageType,
          isInitial: !!s.isInitial,
          isFinal: !!s.isFinal || !!s.isWon || !!s.isLost,
          isWon: !!s.isWon,
          isLost: !!s.isLost
        });
      }
    });

    await mgr.save(updatedStages);

    return this.getActivePipeline(companyId, mgr);
  }
}
