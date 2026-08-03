import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserCompany } from '../database/entities/user-company.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private dataSource: DataSource,
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

    // Consultar membresías activas de este usuario
    const userCompanies = await this.dataSource.getRepository(UserCompany).find({
      where: { userId: user.id, isActive: true },
      relations: { company: true },
    });

    const companies = userCompanies.map((uc) => ({
      id: uc.company.id,
      name: uc.company.name,
      slug: uc.company.slug,
      role: uc.role,
      tipoNegocio: uc.company.tipoNegocio,
    }));

    // Determinar tenant y rol inicial si tiene membresías
    const defaultCompany = companies[0] || null;

    const payload = {
      email: user.email,
      sub: user.id,
      companyId: defaultCompany?.id || null,
      role: defaultCompany?.role || user.role, // fallback al rol global si no hay membresía
      globalRole: user.globalRole,
      fullName: user.fullName,
      supervisorId: user.supervisorId || null,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        companyId: defaultCompany?.id || null,
        role: defaultCompany?.role || user.role,
        globalRole: user.globalRole,
        supervisorId: user.supervisorId || null,
        companies,
      },
    };
  }

  async refresh(user: any) {
    const payload = {
      email: user.email,
      sub: user.id || user.sub,
      companyId: user.companyId || null,
      role: user.role,
      globalRole: user.globalRole || null,
      fullName: user.fullName,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async impersonate(targetUserId: string, currentUser: any) {
    // 1. Validar que el usuario solicitante sea Administrador de Agencia (global) o Local
    const isAgencyAdmin = currentUser.globalRole === 'AGENCY_ADMIN' || currentUser.role === 'AGENCY_ADMIN';
    const isLocalAdmin = currentUser.role === 'ACCOUNT_ADMIN' || currentUser.role === 'ADMIN';

    if (!isAgencyAdmin && !isLocalAdmin) {
      throw new UnauthorizedException('Solo los administradores pueden suplantar identidad');
    }

    // 2. Buscar usuario destino
    const targetUser = await this.usersRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new UnauthorizedException('Usuario objetivo no encontrado');
    }

    if (!targetUser.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // 3. Consultar las membresías del usuario destino
    const targetUserCompanies = await this.dataSource.getRepository(UserCompany).find({
      where: { userId: targetUserId, isActive: true },
      relations: { company: true },
    });

    let activeCompanyId: string | null = null;
    let activeRole: string = 'HUNTER';
    let activeTipoNegocio: string | undefined = undefined;

    if (isAgencyAdmin) {
      // Admin de Agencia: impersonar en el primer tenant que tenga el usuario o null
      activeCompanyId = targetUserCompanies[0]?.companyId || null;
      activeRole = targetUserCompanies[0]?.role || targetUser.role;
      activeTipoNegocio = targetUserCompanies[0]?.company?.tipoNegocio;
    } else {
      // Admin Local: validar que el usuario objetivo pertenezca a la misma empresa
      const targetMembership = targetUserCompanies.find((uc) => uc.companyId === currentUser.companyId);
      if (!targetMembership) {
        throw new UnauthorizedException('El usuario objetivo no pertenece a tu empresa');
      }

      // No permitir que un administrador local suplante a administradores globales
      if (targetUser.globalRole === 'AGENCY_ADMIN') {
        throw new UnauthorizedException('No tienes permisos para suplantar a administradores globales');
      }

      activeCompanyId = currentUser.companyId;
      activeRole = targetMembership.role;
      activeTipoNegocio = targetMembership.company?.tipoNegocio;
    }

    const payload = {
      email: targetUser.email,
      sub: targetUser.id,
      companyId: activeCompanyId,
      role: activeRole,
      globalRole: targetUser.globalRole,
      fullName: targetUser.fullName,
      supervisorId: targetUser.supervisorId || null,
      tipoNegocio: activeTipoNegocio,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: targetUser.id,
        fullName: targetUser.fullName,
        email: targetUser.email,
        companyId: activeCompanyId,
        role: activeRole,
        globalRole: targetUser.globalRole,
        supervisorId: targetUser.supervisorId || null,
        tipoNegocio: activeTipoNegocio,
      },
    };
  }
}
