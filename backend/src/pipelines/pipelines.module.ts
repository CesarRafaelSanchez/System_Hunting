import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pipeline } from '../database/entities/pipeline.entity';
import { PipelineStage } from '../database/entities/pipeline-stage.entity';
import { Opportunity } from '../database/entities/opportunity.entity';
import { PipelinesService } from './pipelines.service';
import { PipelinesController } from './pipelines.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pipeline, PipelineStage, Opportunity])
  ],
  controllers: [PipelinesController],
  providers: [PipelinesService],
  exports: [PipelinesService]
})
export class PipelinesModule {}
