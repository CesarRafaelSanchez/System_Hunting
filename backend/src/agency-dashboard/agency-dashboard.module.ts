import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyDashboardController } from './agency-dashboard.controller';
import { AgencyDashboardService } from './agency-dashboard.service';
import { Opportunity } from '../database/entities/opportunity.entity';
import { Company } from '../database/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Opportunity, Company])],
  controllers: [AgencyDashboardController],
  providers: [AgencyDashboardService],
})
export class AgencyDashboardModule {}
