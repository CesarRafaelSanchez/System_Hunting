import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { Incident } from '../database/entities/incident.entity';
import { IncidentUpdate } from '../database/entities/incident-update.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Incident,
      IncidentUpdate
    ])
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
})
export class IncidentsModule {}
