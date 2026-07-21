import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController } from './companies.controller';
import { Company } from '../database/entities/company.entity';
import { User } from '../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserCompany } from '../database/entities/user-company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, UserCompany]),
    AuthModule
  ],
  controllers: [CompaniesController],
})
export class CompaniesModule {}
