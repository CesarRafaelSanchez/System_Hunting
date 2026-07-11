import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({ where: { email: loginDto.email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = { email: user.email, sub: user.id, companyId: user.companyId, role: user.role, fullName: user.fullName };
    
    // Aquí podríamos retornar también un Refresh Token
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        companyId: user.companyId,
        role: user.role
      }
    };
  }

  async refresh(user: any) {
    const payload = { email: user.email, sub: user.id, companyId: user.companyId, role: user.role, fullName: user.fullName };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async impersonate(targetUserId: string, currentUser: any) {
    if (currentUser.role !== 'ADMIN') {
      throw new UnauthorizedException('Solo los administradores pueden suplantar identidad');
    }

    const targetUser = await this.usersRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new UnauthorizedException('Usuario objetivo no encontrado');
    }

    if (!targetUser.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = { email: targetUser.email, sub: targetUser.id, companyId: targetUser.companyId, role: targetUser.role, fullName: targetUser.fullName };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: targetUser.id,
        fullName: targetUser.fullName,
        email: targetUser.email,
        companyId: targetUser.companyId,
        role: targetUser.role
      }
    };
  }
}
