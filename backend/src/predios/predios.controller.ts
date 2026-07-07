import { Controller, Post, Put, Body, Param, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { PrediosService } from './predios.service';
import { CreatePredioDto } from './dto/create-predio.dto';
import { UpdatePredioDto } from './dto/update-predio.dto';
import { CreatePropertyContactDto } from './dto/create-property-contact.dto';
import { AuthGuard } from '@nestjs/passport';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';

@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TransactionAuditInterceptor)
@Controller('predios')
export class PrediosController {
  constructor(private readonly prediosService: PrediosService) {}

  @Post()
  async createPredio(@Request() req: any, @Body() createPredioDto: CreatePredioDto, @TransactionManager() manager: EntityManager) {
    try {
      return await this.prediosService.createPredio(req.user, createPredioDto, manager);
    } catch (error) {
      return { status: 'error', message: error.message, stack: error.stack };
    }
  }

  @Put(':id')
  async updatePredio(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updatePredioDto: UpdatePredioDto,
    @TransactionManager() manager: EntityManager
  ) {
    return this.prediosService.updatePredio(id, req.user, updatePredioDto, manager);
  }

  @Post(':id/contacts')
  async addContact(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: CreatePropertyContactDto,
    @TransactionManager() manager: EntityManager
  ) {
    return this.prediosService.addContact(id, req.user, dto, manager);
  }
}
