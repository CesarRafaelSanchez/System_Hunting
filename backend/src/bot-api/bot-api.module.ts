import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotApiController } from './bot-api.controller';
import { Opportunity } from '../database/entities/opportunity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Opportunity]),
  ],
  controllers: [BotApiController],
})
export class BotApiModule {}
