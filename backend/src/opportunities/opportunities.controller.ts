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
}
