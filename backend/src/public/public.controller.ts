import { Controller, Get, Post, Patch, Body, Param, NotFoundException, UseInterceptors, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { OpportunitiesService } from '../opportunities/opportunities.service';
import { UsersService } from '../users/users.service';
import { CreateOpportunityDto } from '../opportunities/dto/create-opportunity.dto';
import { EntityManager } from 'typeorm';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';

import { PrediosService } from '../predios/predios.service';
import { CreateRegistroInicialDto } from '../predios/dto/create-registro-inicial.dto';
import { BadRequestException } from '@nestjs/common';

@UseGuards(ThrottlerGuard)
@Controller('public')
export class PublicController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
    private readonly usersService: UsersService,
    private readonly prediosService: PrediosService
  ) {}

  @Get('hunters')
  async getHunters() {
    const allUsers = await this.usersService.findAll();
    const hunters = allUsers.filter(u => u.role === 'HUNTER' && u.isActive);
    return hunters.map(h => ({
      id: h.id,
      fullName: h.fullName,
      email: h.email
    }));
  }

  @Get('supervisors')
  async getSupervisors() {
    const allUsers = await this.usersService.findAll();
    const supervisors = allUsers.filter(u => u.isActive && u.role && ['ADMIN', 'BACKOFFICE', 'SUPERVISOR', 'AGENCY_ADMIN', 'ACCOUNT_ADMIN'].includes(u.role));
    return supervisors.map(s => ({
      id: s.id,
      fullName: s.fullName,
      role: s.role
    }));
  }

  @Get('opportunities/:id')
  async getOpportunityPublic(@Param('id') id: string, @TransactionManager() manager: EntityManager) {
    // Admin user mock just to bypass companyId filter
    const opps = await this.opportunitiesService.findAll({ role: 'ADMIN' });
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
      companyId: hunter.userCompanies && hunter.userCompanies.length > 0 ? hunter.userCompanies[0].companyId : null
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
    return this.opportunitiesService.updateOpportunity(id, { role: 'ADMIN' }, dto, manager);
  }
}
