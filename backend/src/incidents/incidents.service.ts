import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateIncidentDto, CreateIncidentUpdateDto } from './dto/incident.dto';
import { Incident } from '../database/entities/incident.entity';
import { IncidentUpdate } from '../database/entities/incident-update.entity';
import { Opportunity } from '../database/entities/opportunity.entity';

@Injectable()
export class IncidentsService {
  
  async createIncident(user: any, dto: CreateIncidentDto, manager: EntityManager) {
    const opp = await manager.findOne(Opportunity, { where: { id: dto.opportunityId, companyId: user.companyId } });
    if (!opp) throw new NotFoundException('Oportunidad no encontrada');

    const incident = manager.create(Incident, {
      companyId: user.companyId,
      opportunityId: dto.opportunityId,
      propertyId: dto.propertyId,
      incidentType: dto.incidentType,
      severity: dto.severity,
      description: dto.description,
      status: 'OPEN',
      reportedByUserId: user.id,
      reportedAt: new Date()
    });

    return await manager.save(incident);
  }

  async addUpdate(incidentId: string, user: any, dto: CreateIncidentUpdateDto, manager: EntityManager) {
    const incident = await manager.findOne(Incident, { where: { id: incidentId, companyId: user.companyId } });
    if (!incident) throw new NotFoundException('Incidente no encontrado');

    const update = manager.create(IncidentUpdate, {
      incidentId: incident.id,
      userId: user.id,
      comment: dto.comment,
      nextAction: dto.nextAction,
      nextFollowUpDate: dto.nextFollowUpDate ? new Date(dto.nextFollowUpDate) : undefined
    });

    return await manager.save(update);
  }
}
