import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../database/entities/user.entity';
import { Company } from '../database/entities/company.entity';
import { UserCompany } from '../database/entities/user-company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, UserCompany])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
