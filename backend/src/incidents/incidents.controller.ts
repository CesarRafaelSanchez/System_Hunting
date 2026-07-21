import { Controller, Post, Body, Param, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto, CreateIncidentUpdateDto } from './dto/incident.dto';
import { AuthGuard } from '@nestjs/passport';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { TenantGuard } from '../auth/guards/tenant.guard';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@UseInterceptors(TransactionAuditInterceptor)
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  async createIncident(
    @Request() req: any,
    @Body() dto: CreateIncidentDto,
    @TransactionManager() manager: EntityManager
  ) {
    return this.incidentsService.createIncident(req.user, dto, manager);
  }

  @Post(':id/updates')
  async addUpdate(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: CreateIncidentUpdateDto,
    @TransactionManager() manager: EntityManager
  ) {
    return this.incidentsService.addUpdate(id, req.user, dto, manager);
  }
}
