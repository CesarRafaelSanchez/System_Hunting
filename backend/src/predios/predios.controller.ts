import { Controller, Post, Put, Body, Param, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { PrediosService } from './predios.service';
import { CreateRegistroInicialDto } from './dto/create-registro-inicial.dto';
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
  async createPredio(@Request() req: any, @Body() createPredioDto: CreateRegistroInicialDto, @TransactionManager() manager: EntityManager) {
    try {
      return await this.prediosService.createPredio(req.user, createPredioDto, manager);
    } catch (error) {
      console.error('[PrediosController] Error al crear predio:', error.message, error.stack);
      throw error; // Re-lanzar para que NestJS devuelva el HTTP correcto (400/500)
    }
  }

  @Post('bulk')
  async createPrediosBulk(@Request() req: any, @Body() bulkDtos: CreateRegistroInicialDto[], @TransactionManager() manager: EntityManager) {
    const results = [];
    for (const dto of bulkDtos) {
      try {
        const result = await this.prediosService.createPredio(req.user, dto, manager);
        results.push(result);
      } catch (error) {
        console.error(`[PrediosController] Error en bulk al crear predio ${dto.nombreProyecto}:`, error.message);
      }
    }
    return results;
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
