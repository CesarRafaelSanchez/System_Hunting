import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AgencyDashboardService } from './agency-dashboard.service';

@UseGuards(AuthGuard('jwt'))
@Controller('agency-dashboard')
export class AgencyDashboardController {
  constructor(private readonly dashboardService: AgencyDashboardService) {}

  private checkGlobalAdmin(req: any) {
    if (req.user.globalRole !== 'AGENCY_ADMIN' && req.user.role !== 'AGENCY_ADMIN') {
      throw new ForbiddenException('Requiere privilegios de AGENCY_ADMIN para acceder a estas métricas globales');
    }
  }

  @Get('kpis')
  async getKpis(@Request() req: any) {
    this.checkGlobalAdmin(req);
    return this.dashboardService.getKpis();
  }

  @Get('performance-matrix')
  async getPerformanceMatrix(@Request() req: any) {
    this.checkGlobalAdmin(req);
    return this.dashboardService.getPerformanceMatrix();
  }
}
