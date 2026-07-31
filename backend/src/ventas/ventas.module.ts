import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { VentasController } from './ventas.controller';
import { VentaFijaService } from './services/venta-fija.service';
import { VentaFija } from '../database/entities/venta-fija.entity';
import { Opportunity } from '../database/entities/opportunity.entity';
import { PipelineStage } from '../database/entities/pipeline-stage.entity';
import { OpportunityStageHistory } from '../database/entities/opportunity-stage-history.entity';
import { FormSubmission } from '../database/entities/form-submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VentaFija, 
      Opportunity, 
      PipelineStage, 
      OpportunityStageHistory, 
      FormSubmission
    ]),
    BullModule.registerQueue({
      name: 'report-generation',
    }),
  ],
  controllers: [VentasController],
  providers: [VentaFijaService],
  exports: [VentaFijaService],
})
export class VentasModule {}
