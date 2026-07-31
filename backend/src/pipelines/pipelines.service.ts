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
    
    const pipeline = await mgr.findOne(Pipeline, {
      where: { isActive: true, companyId }
    });

    if (!pipeline) {
      throw new NotFoundException('No se encontró un pipeline activo para esta empresa.');
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

  async createPipeline(companyId: string, dto: CreatePipelineDto, manager: EntityManager) {
    this.validateStages(dto.stages);

    // Desactivar cualquier pipeline activo existente para esta empresa
    await manager.update(Pipeline, { isActive: true, companyId }, { isActive: false });

    // Crear nuevo pipeline
    const pipeline = manager.create(Pipeline, {
      name: dto.name,
      code: dto.code,
      description: dto.description,
      companyId,
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

    return this.getActivePipeline(companyId, manager);
  }

  async updatePipeline(id: string, companyId: string, dto: UpdatePipelineDto, manager: EntityManager) {
    this.validateStages(dto.stages);

    const pipeline = await manager.findOne(Pipeline, { where: { id, companyId } });
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

    return this.getActivePipeline(companyId, manager);
  }
}
