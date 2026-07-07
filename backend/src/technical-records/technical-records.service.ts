import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateTechnicalRecordDto } from './dto/create-technical-record.dto';
import { TechnicalRecord } from '../database/entities/technical-record.entity';
import { TechnicalRecordDetail } from '../database/entities/technical-record-detail.entity';
import { Opportunity } from '../database/entities/opportunity.entity';
import { Predio } from '../database/entities/predio.entity';

@Injectable()
export class TechnicalRecordsService {
  
  async createTechnicalRecord(user: any, dto: CreateTechnicalRecordDto, manager: EntityManager) {
    const opportunity = await manager.findOne(Opportunity, { where: { id: dto.opportunityId, companyId: user.companyId } });
    if (!opportunity) throw new NotFoundException('Oportunidad no encontrada');

    const property = await manager.findOne(Predio, { where: { id: dto.propertyId, companyId: user.companyId } });
    if (!property) throw new NotFoundException('Predio no encontrado');

    // 1. Crear el Technical Record (cabecera)
    const record = manager.create(TechnicalRecord, {
      companyId: user.companyId,
      opportunityId: dto.opportunityId,
      propertyId: dto.propertyId,
      status: 'PENDING',
      completedByUserId: user.id
    });
    
    const savedRecord = await manager.save(record);

    // 2. Crear el detalle con las descripciones técnicas
    const detail = manager.create(TechnicalRecordDetail, {
      technicalRecordId: savedRecord.id,
      facadeDescription: dto.facadeDescription,
      mountingDescription: dto.mountingDescription,
      accessDescription: dto.accessDescription,
      internalRouteDescription: dto.internalRouteDescription,
      externalRouteDescription: dto.externalRouteDescription,
      powerAvailability: dto.powerAvailability,
      technicalFeasibility: dto.technicalFeasibility,
      comments: dto.comments
    });

    await manager.save(detail);

    return savedRecord;
  }
}
