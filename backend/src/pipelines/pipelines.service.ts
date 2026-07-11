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

  async getActivePipeline(manager?: EntityManager) {
    const mgr = manager || this.dataSource.manager;
    
    let pipeline = await mgr.findOne(Pipeline, {
      where: { isActive: true }
    });

    if (!pipeline) {
      // Crear pipeline por defecto automáticamente
      const defaultPipeline = mgr.create(Pipeline, {
        name: 'Pipeline Comercial Principal',
        code: 'PCP',
        description: 'Pipeline comercial por defecto autogenerado por el sistema.',
        isActive: true
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

  async createPipeline(dto: CreatePipelineDto, manager: EntityManager) {
    this.validateStages(dto.stages);

    // Desactivar cualquier pipeline activo existente
    await manager.update(Pipeline, { isActive: true }, { isActive: false });

    // Crear nuevo pipeline
    const pipeline = manager.create(Pipeline, {
      name: dto.name,
      code: dto.code,
      description: dto.description,
      isActive: true
    });
    const savedPipeline = await manager.save(pipeline);

    // Crear etapas
    const stages = dto.stages.map((s, index) => {
      return manager.create(PipelineStage, {
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

    await manager.save(stages);

    return this.getActivePipeline(manager);
  }

  async updatePipeline(id: string, dto: UpdatePipelineDto, manager: EntityManager) {
    this.validateStages(dto.stages);

    const pipeline = await manager.findOne(Pipeline, { where: { id } });
    if (!pipeline) {
      throw new NotFoundException('Pipeline no encontrado');
    }

    // Actualizar metadatos del pipeline
    pipeline.name = dto.name;
    pipeline.code = dto.code;
    pipeline.description = dto.description || '';
    await manager.save(pipeline);

    // Obtener etapas actuales en la base de datos
    const currentStages = await manager.find(PipelineStage, { where: { pipelineId: id } });

    // Identificar etapas eliminadas (las que están en DB pero no vienen en el DTO)
    const incomingIds = dto.stages.map(s => s.id).filter(Boolean);
    const deletedStages = currentStages.filter(s => !incomingIds.includes(s.id));

    // Validar que las etapas eliminadas no tengan oportunidades asociadas
    for (const ds of deletedStages) {
      const hasOpps = await manager.findOne(Opportunity, { where: { currentStageId: ds.id } });
      if (hasOpps) {
        throw new BadRequestException(
          `No se puede eliminar la etapa "${ds.name}" porque tiene oportunidades comerciales asociadas.`
        );
      }
    }

    // Proceder a eliminar etapas obsoletas
    if (deletedStages.length > 0) {
      await manager.remove(deletedStages);
    }

    // Actualizar o crear etapas recibidas
    const updatedStages = dto.stages.map((s, index) => {
      const existing = currentStages.find(cs => cs.id === s.id);
      if (existing) {
        // Actualizar existente
        existing.name = s.name;
        existing.code = s.code;
        existing.position = index + 1;
        existing.stageType = s.stageType;
        existing.isInitial = !!s.isInitial;
        existing.isFinal = !!s.isFinal || !!s.isWon || !!s.isLost;
        existing.isWon = !!s.isWon;
        existing.isLost = !!s.isLost;
        return existing;
      } else {
        // Crear nueva
        return manager.create(PipelineStage, {
          pipelineId: id,
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

    await manager.save(updatedStages);

    return this.getActivePipeline(manager);
  }
}
