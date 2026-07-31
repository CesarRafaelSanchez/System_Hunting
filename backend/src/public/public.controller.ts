import { Controller, Get, Post, Patch, Body, Param, NotFoundException, BadRequestException, UseInterceptors, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UsersService } from '../users/users.service';
import { PrediosService } from '../predios/predios.service';
import { HuntingService } from '../hunting/services/hunting.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';

@UseGuards(ThrottlerGuard)
@Controller('public')
export class PublicController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prediosService: PrediosService,
    private readonly huntingService: HuntingService,
    private readonly pipelinesService: PipelinesService
  ) {}

  @Get('hunters')
  async getHunters() {
    const users = await this.usersService.findAll({ globalRole: 'AGENCY_ADMIN' }); // Mock para saltar tenancy
    return users.filter(u => u.role === 'HUNTER' || u.role === 'REFERRAL').map(u => ({
      id: u.id,
      fullName: u.fullName,
      role: u.role
    }));
  }

  @Get('supervisors')
  async getSupervisors() {
    const users = await this.usersService.findAll({ globalRole: 'AGENCY_ADMIN' });
    return users.filter(u => u.role === 'BACKOFFICE').map(s => ({
      id: s.id,
      fullName: s.fullName,
      role: s.role
    }));
  }

  @Get('opportunities/:id')
  async getOpportunityPublic(@Param('id') id: string, @TransactionManager() manager: EntityManager) {
    // Admin user mock just to bypass companyId filter
    const opps = await this.huntingService.findAllHunting({ globalRole: 'AGENCY_ADMIN' });
    const opp = opps.find(o => o.id === id);
    if (!opp) throw new NotFoundException('Oportunidad no encontrada');
    return opp;
  }

  @Post('registro-predio')
  @UseInterceptors(TransactionAuditInterceptor)
  async createOpportunityPublic(
    @Body() dto: any,
    @TransactionManager() manager: EntityManager
  ) {
    if (dto.isReferral) {
      if (!dto.referredHunterName || !dto.partnerSupervisorId) {
        throw new BadRequestException('Datos de referido incompletos');
      }
      
      const mockUser = {
        id: dto.partnerSupervisorId, // We use supervisor's ID temporarily, predios.service handles isReferral
        role: 'REFERRAL', 
        companyId: null
      };

      return this.prediosService.createPredio(mockUser, dto, manager);
    }

    if (!dto.ejecutivo) {
      throw new BadRequestException('El ID del Hunter (ejecutivo) es requerido.');
    }
    const hunter = await this.usersService.findOne(dto.ejecutivo);
    if (!hunter) {
      throw new BadRequestException('Hunter no encontrado');
    }

    const mockUser = {
      id: hunter.id,
      role: 'HUNTER',
      companyId: hunter.companyId
    };

    return this.prediosService.createPredio(mockUser, dto, manager);
  }

  @Patch('opportunities/:id/form')
  @UseInterceptors(TransactionAuditInterceptor)
  async updateOpportunityForm(
    @Param('id') id: string,
    @Body() dto: any,
    @TransactionManager() manager: EntityManager
  ) {
    return this.huntingService.updateHuntingOpportunity(id, { globalRole: 'AGENCY_ADMIN' }, dto, manager);
  }
}
