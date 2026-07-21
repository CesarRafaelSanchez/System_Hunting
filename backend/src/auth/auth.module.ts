import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { JwtStrategy } from './jwt.strategy';
import { UserCompany } from '../database/entities/user-company.entity';
import { TenantGuard } from './guards/tenant.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserCompany]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TenantGuard],
  exports: [AuthService, TenantGuard],
})
export class AuthModule {}
