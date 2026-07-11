import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { UsersModule } from '../users/users.module';
import { OpportunitiesModule } from '../opportunities/opportunities.module';
import { PrediosModule } from '../predios/predios.module';

@Module({
  imports: [UsersModule, OpportunitiesModule, PrediosModule],
  controllers: [PublicController]
})
export class PublicModule {}
