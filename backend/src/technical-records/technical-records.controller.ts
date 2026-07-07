import { Controller, Post, Body, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { TechnicalRecordsService } from './technical-records.service';
import { CreateTechnicalRecordDto } from './dto/create-technical-record.dto';
import { AuthGuard } from '@nestjs/passport';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';

@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TransactionAuditInterceptor)
@Controller('technical-records')
export class TechnicalRecordsController {
  constructor(private readonly techService: TechnicalRecordsService) {}

  @Post()
  async createTechnicalRecord(
    @Request() req: any,
    @Body() dto: CreateTechnicalRecordDto,
    @TransactionManager() manager: EntityManager
  ) {
    return this.techService.createTechnicalRecord(req.user, dto, manager);
  }
}
