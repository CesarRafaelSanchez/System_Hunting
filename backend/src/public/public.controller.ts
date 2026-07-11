import { Controller, Get, Post, Patch, Body, Param, NotFoundException } from '@nestjs/common';
import { OpportunitiesService } from '../opportunities/opportunities.service';
import { UsersService } from '../users/users.service';
import { CreateOpportunityDto } from '../opportunities/dto/create-opportunity.dto';
import { EntityManager } from 'typeorm';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';

import { PrediosService } from '../predios/predios.service';
import { CreatePredioDto } from '../predios/dto/create-predio.dto';
import { BadRequestException } from '@nestjs/common';

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

  @Get('opportunities/:id')
  async getOpportunityPublic(@Param('id') id: string, @TransactionManager() manager: EntityManager) {
    // Admin user mock just to bypass companyId filter
    const opps = await this.opportunitiesService.findAll({ role: 'ADMIN' });
    const opp = opps.find(o => o.id === id);
    if (!opp) throw new NotFoundException('Oportunidad no encontrada');
    return opp;
  }

  @Post('registro-predio')
  async createOpportunityPublic(
    @Body() dto: any,
    @TransactionManager() manager: EntityManager
  ) {
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
  async updateOpportunityForm(
    @Param('id') id: string,
    @Body() dto: any,
    @TransactionManager() manager: EntityManager
  ) {
    return this.opportunitiesService.updateOpportunity(id, { role: 'ADMIN' }, dto, manager);
  }
}
