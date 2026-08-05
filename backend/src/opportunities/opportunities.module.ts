import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesController } from './opportunities.controller';
import { Opportunity } from '../database/entities/opportunity.entity';
import { OpportunityStageHistory } from '../database/entities/opportunity-stage-history.entity';
import { Pipeline } from '../database/entities/pipeline.entity';
import { PipelineStage } from '../database/entities/pipeline-stage.entity';
import { LeadSource } from '../database/entities/lead-source.entity';
import { OpportunityNote } from '../database/entities/opportunity-note.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Opportunity,
      OpportunityStageHistory,
      Pipeline,
      PipelineStage,
      LeadSource,
      OpportunityNote
    ]),
    BullModule.registerQueue({
      name: 'report-generation',
    }),
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
