import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicalRecordsService } from './technical-records.service';
import { TechnicalRecordsController } from './technical-records.controller';
import { TechnicalRecord } from '../database/entities/technical-record.entity';
import { TechnicalRecordDetail } from '../database/entities/technical-record-detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TechnicalRecord,
      TechnicalRecordDetail
    ])
  ],
  controllers: [TechnicalRecordsController],
  providers: [TechnicalRecordsService],
})
export class TechnicalRecordsModule {}
