import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReportProcessor } from './report.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Opportunity } from '../database/entities/opportunity.entity';
import { DispatchModule } from '../dispatch/dispatch.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'report-generation',
    }),
    TypeOrmModule.forFeature([Opportunity]),
    DispatchModule,
  ],
  providers: [ReportProcessor],
  exports: [BullModule],
})
export class ReportQueueModule {}
