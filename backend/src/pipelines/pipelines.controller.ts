import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, UseInterceptors, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto, UpdatePipelineDto } from './dto/create-pipeline.dto';

@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TransactionAuditInterceptor)
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  private checkAdmin(req: any) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden realizar esta acción');
    }
  }

  @Get('active')
  async getActivePipeline() {
    // Las lecturas son públicas para cualquier usuario logueado (Hunters y BO también las necesitan para registrar predios / Kanban)
    return this.pipelinesService.getActivePipeline();
  }

  @Post()
  async createPipeline(
    @Request() req: any,
    @Body() dto: CreatePipelineDto,
    @TransactionManager() manager: EntityManager
  ) {
    this.checkAdmin(req);
    return this.pipelinesService.createPipeline(dto, manager);
  }

  @Put(':id')
  async updatePipeline(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
    @TransactionManager() manager: EntityManager
  ) {
    this.checkAdmin(req);
    return this.pipelinesService.updatePipeline(id, dto, manager);
  }
}
