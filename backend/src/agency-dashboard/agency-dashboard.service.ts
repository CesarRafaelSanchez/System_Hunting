import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from '../database/entities/opportunity.entity';
import { Company } from '../database/entities/company.entity';
import { Predio } from '../database/entities/predio.entity'; // Need this if we query predios globally, but we can join from company or just query opportunities

@Injectable()
export class AgencyDashboardService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async getKpis() {
    // totalPipeline: SUM of amount where status = 'OPEN'
    const pipelineResult = await this.opportunityRepo
      .createQueryBuilder('opp')
      .leftJoin('opp.ventaFija', 'vf')
      .select('SUM(CAST(vf.cargoFijoSinIgv AS numeric))', 'total')
      .where('opp.status = :status', { status: 'OPEN' })
      .getRawOne();
    
    // totalClosedWon: SUM of amount where status = 'WON'
    const wonResult = await this.opportunityRepo
      .createQueryBuilder('opp')
      .leftJoin('opp.ventaFija', 'vf')
      .select('SUM(CAST(vf.cargoFijoSinIgv AS numeric))', 'total')
      .where('opp.status = :status', { status: 'WON' })
      .getRawOne();

    // slaAlerts: count opportunities where currentStageEnteredAt > 5 days (status = OPEN)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const slaAlerts = await this.opportunityRepo
      .createQueryBuilder('opp')
      .where('opp.status = :status', { status: 'OPEN' })
      .andWhere('opp.currentStageEnteredAt <= :fiveDaysAgo', { fiveDaysAgo })
      .getCount();

    // totalPredios: For simplicity, we could count distinct predio_id from opportunities or just query the predios repository if injected. 
    // Wait, let's query the predios repository directly using the manager from connection, or count them from Opportunities with predio.
    // The easiest is just query the raw table predios.
    const prediosCount = await this.opportunityRepo.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('predios', 'p')
      .getRawOne();

    return {
      totalPipeline: parseFloat(pipelineResult?.total || '0'),
      totalClosedWon: parseFloat(wonResult?.total || '0'),
      totalPredios: parseInt(prediosCount?.count || '0', 10),
      slaAlerts: slaAlerts
    };
  }

  async getPerformanceMatrix() {
    // Group by company
    // Return: companyId, companyName, tipoNegocio, activeOpportunitiesCount, pipelineValue, wonCount
    const query = await this.companyRepo
      .createQueryBuilder('c')
      .select([
        'c.id AS "companyId"',
        'c.name AS "companyName"',
        'c.tipoNegocio AS "tipoNegocio"',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(opp.id)', 'activeOpportunitiesCount')
          .from(Opportunity, 'opp')
          .where('opp.companyId = c.id')
          .andWhere('opp.status = :status', { status: 'OPEN' });
      }, 'activeOpportunitiesCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COALESCE(SUM(CAST(vf.cargoFijoSinIgv AS numeric)), 0)', 'pipelineValue')
          .from(Opportunity, 'opp')
          .leftJoin('opp.ventaFija', 'vf')
          .where('opp.companyId = c.id')
          .andWhere('opp.status = :status', { status: 'OPEN' });
      }, 'pipelineValue')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(opp.id)', 'wonCount')
          .from(Opportunity, 'opp')
          .where('opp.companyId = c.id')
          .andWhere('opp.status = :status', { status: 'WON' });
      }, 'wonCount')
      .orderBy('c.name', 'ASC')
      .getRawMany();

    return query.map(row => ({
      companyId: row.companyId,
      companyName: row.companyName,
      tipoNegocio: row.tipoNegocio,
      activeOpportunitiesCount: parseInt(row.activeOpportunitiesCount || '0', 10),
      pipelineValue: parseFloat(row.pipelineValue || '0'),
      wonCount: parseInt(row.wonCount || '0', 10)
    }));
  }
}
