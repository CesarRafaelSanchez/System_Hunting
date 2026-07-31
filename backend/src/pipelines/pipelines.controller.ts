import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, UseInterceptors, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto, UpdatePipelineDto } from './dto/create-pipeline.dto';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@UseInterceptors(TransactionAuditInterceptor)
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  private checkAdmin(req: any) {
    const isAgencyAdmin = req.user?.globalRole === 'AGENCY_ADMIN' || req.user?.role === 'AGENCY_ADMIN';
    const isLocalAdmin = req.user?.role === 'ACCOUNT_ADMIN' || req.user?.role === 'ADMIN';
    if (!isAgencyAdmin && !isLocalAdmin) {
      throw new ForbiddenException('Solo los administradores pueden realizar esta acción');
    }
  }

  @Get('active')
  async getActivePipeline(@Request() req: any) {
    return this.pipelinesService.getActivePipeline(req.user.companyId);
  }

  @Post()
  async createPipeline(
    @Request() req: any,
    @Body() dto: CreatePipelineDto,
    @TransactionManager() manager: EntityManager
  ) {
    this.checkAdmin(req);
    return this.pipelinesService.createPipeline(req.user.companyId, dto, manager);
  }

  @Put(':id')
  async updatePipeline(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
    @TransactionManager() manager: EntityManager
  ) {
    this.checkAdmin(req);
    return this.pipelinesService.updatePipeline(id, req.user.companyId, dto, manager);
  }
}
