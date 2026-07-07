import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from '../database/entities/opportunity.entity';
// Importamos Predio si existiera, pero MVP simulamos consulta contra Opportunity

@UseGuards(ApiKeyGuard)
@Controller('api/cache/predios')
export class BotApiController {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
  ) {}

  @Get()
  async checkPredioStatus(@Query('q') query: string) {
    if (!query) {
      return { status: 'error', message: 'Debe proporcionar un parámetro "q" para buscar' };
    }

    // MVP: Simulamos la búsqueda del predio. En prod real sería una búsqueda de texto completo 
    // en la tabla de Predios o en un caché en Redis (de ahí el nombre /api/cache/predios).
    // Aquí hacemos una consulta rápida a Opportunity para ver si existe un registro activo
    // (A fines de MVP)
    const exists = await this.opportunityRepository.findOne({
      where: [
        { code: query }, // Buscaría por nombre o dirección en la realidad
      ]
    });

    if (exists) {
      return {
        status: 'found',
        data: {
          id: exists.id,
          estado: exists.status,
          mensaje: `Atención: El predio ya se encuentra en el pipeline bajo el estado ${exists.status}.`
        }
      };
    }

    return {
      status: 'not_found',
      message: 'Predio libre. Puede ser asignado.'
    };
  }
}
