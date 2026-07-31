import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { UsersModule } from '../users/users.module';
import { HuntingModule } from '../hunting/hunting.module';
import { PrediosModule } from '../predios/predios.module';
import { PipelinesModule } from '../pipelines/pipelines.module';

@Module({
  imports: [UsersModule, HuntingModule, PrediosModule, PipelinesModule],
  controllers: [PublicController]
})
export class PublicModule {}
