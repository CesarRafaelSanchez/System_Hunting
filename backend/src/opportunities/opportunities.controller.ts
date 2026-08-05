import { Controller, Post, Patch, Get, Body, Param, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { TransitionStageDto } from './dto/transition-stage.dto';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@UseInterceptors(TransactionAuditInterceptor)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  async createOpportunity(
    @Request() req: any,
    @Body() createOpportunityDto: CreateOpportunityDto,
    @TransactionManager() manager: EntityManager
  ) {
    return this.opportunitiesService.createOpportunity(req.user, createOpportunityDto, manager);
  }

  @Get()
  async findAll(@Request() req: any) {
    // Retornamos raw opportunities con map a formato esperado por el frontend
    const opps = await this.opportunitiesService.findAll(req.user);
    return opps.map(o => ({
      ...o,
      id: o.id,
      title: o.property?.nombreProyecto || o.ventaFija?.razonSocial || `Op: ${o.code}`,
      subtitle: o.property?.nombreVia || o.ventaFija?.ruc || `Etapa ID: ${o.currentStageId?.slice(0,5)}`,
      stage: o.currentStage ? (o.currentStage.position - 1) : (o.status === 'OPEN' ? 0 : (o.status === 'WON' ? 18 : 19)),
      property: o.property ? {
        ...o.property,
        distrito: o.property.distrito
      } : null,
      ventaFija: o.ventaFija || null,
      company: o.company ? {
        id: o.company.id,
        name: o.company.name,
        tipoNegocio: o.company.tipoNegocio
      } : null,
      createdByUserName: o.currentOwnerUser?.fullName || null
    }));
  }

  @Post('bulk')
  async createOpportunitiesBulk(
    @Request() req: any,
    @Body() bulkDtos: CreateOpportunityDto[],
    @TransactionManager() manager: EntityManager
  ) {
    return this.opportunitiesService.createOpportunitiesBulk(req.user, bulkDtos, manager);
  }




  @Post(':id/approve')
  async approveOpportunity(
    @Param('id') id: string,
    @Request() req: any,
    @TransactionManager() manager: EntityManager
  ) {
    // Respond HTTP 202 and push to queue
    return this.opportunitiesService.queueApproval(id, req.user, manager);
  }

  @Get(':id/export-status')
  async getExportStatus(@Param('id') id: string) {
    return this.opportunitiesService.getExportStatus(id);
  }

  @Get(':id/submissions')
  async getSubmissions(
    @Param('id') id: string,
    @Request() req: any
  ) {
    return this.opportunitiesService.getSubmissions(id, req.user);
  }

  @Post(':id/notes')
  async addNote(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req: any
  ) {
    return this.opportunitiesService.addNote(id, req.user.id, content);
  }

  @Get(':id/notes')
  async getNotes(
    @Param('id') id: string,
    @Request() req: any
  ) {
    return this.opportunitiesService.getNotes(id, req.user);
  }

  @Get(':id/history')
  async getHistory(
    @Param('id') id: string,
    @Request() req: any
  ) {
    return this.opportunitiesService.getHistory(id, req.user);
  }
}
