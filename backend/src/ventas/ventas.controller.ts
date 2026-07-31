import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { VentaFijaService } from './services/venta-fija.service';
import { CreateVentaFijaDto } from './dto/create-venta-fija.dto';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@UseInterceptors(TransactionAuditInterceptor)
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventaFijaService: VentaFijaService) {}

  @Post('fija')
  async createVentaFija(
    @Request() req: any,
    @Body() dto: CreateVentaFijaDto,
    @TransactionManager() manager: EntityManager,
  ) {
    return this.ventaFijaService.createVentaFija(req.user, dto, manager);
  }

  @Get('opportunities')
  async findAll(@Request() req: any) {
    return this.ventaFijaService.findAllVentas(req.user);
  }

  @Patch('opportunities/:id')
  async updateOpportunity(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: any,
    @TransactionManager() manager: EntityManager,
  ) {
    return this.ventaFijaService.updateVentaOpportunity(id, req.user, dto, manager);
  }

  @Patch('opportunities/:id/stage')
  async transitionStage(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: any,
    @TransactionManager() manager: EntityManager,
  ) {
    return this.ventaFijaService.transitionVentaStage(id, req.user, dto, manager);
  }
}
