import { Controller, Get, Patch, Post, Body, Param, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { HuntingService } from './services/hunting.service';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { CreatePredioDto } from './dto/create-predio.dto';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@UseInterceptors(TransactionAuditInterceptor)
@Controller('hunting')
export class HuntingController {
  constructor(private readonly huntingService: HuntingService) {}

  @Post('opportunities')
  async createOpportunity(
    @Request() req: any,
    @Body() dto: CreatePredioDto,
    @TransactionManager() manager: EntityManager,
  ) {
    return this.huntingService.createHuntingOpportunity(req.user, dto, manager);
  }

  @Get('opportunities')
  async findAll(@Request() req: any) {
    return this.huntingService.findAllHunting(req.user);
  }

  @Patch('opportunities/:id')
  async updateOpportunity(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: any,
    @TransactionManager() manager: EntityManager,
  ) {
    return this.huntingService.updateHuntingOpportunity(id, req.user, dto, manager);
  }

  @Patch('opportunities/:id/stage')
  async transitionStage(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: any,
    @TransactionManager() manager: EntityManager,
  ) {
    return this.huntingService.transitionHuntingStage(id, req.user, dto, manager);
  }
}
