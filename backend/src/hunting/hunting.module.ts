import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { HuntingService } from './services/hunting.service';
import { HuntingController } from './hunting.controller';
import { Opportunity } from '../database/entities/opportunity.entity';
import { OpportunityStageHistory } from '../database/entities/opportunity-stage-history.entity';
import { PipelineStage } from '../database/entities/pipeline-stage.entity';
import { Predio } from '../database/entities/predio.entity';
import { Torre } from '../database/entities/torre.entity';
import { Piso } from '../database/entities/piso.entity';
import { Distrito } from '../database/entities/distrito.entity';
import { FormSubmission } from '../database/entities/form-submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Opportunity,
      OpportunityStageHistory,
      PipelineStage,
      Predio,
      Torre,
      Piso,
      Distrito,
      FormSubmission
    ]),
    BullModule.registerQueue({
      name: 'report-generation',
    }),
  ],
  controllers: [HuntingController],
  providers: [HuntingService],
  exports: [HuntingService],
})
export class HuntingModule {}
