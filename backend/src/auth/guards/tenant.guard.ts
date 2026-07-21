import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCompany } from '../../database/entities/user-company.entity';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    @InjectRepository(UserCompany)
    private userCompanyRepository: Repository<UserCompany>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!tenantId) {
      throw new BadRequestException('El header x-tenant-id es requerido para esta ruta');
    }

    if (user.globalRole === 'AGENCY_ADMIN' || user.globalRole === 'AGENCY_SUPPORT') {
      request.tenantId = tenantId;
      request.tenantRole = user.globalRole;

      // Backwards compatibility
      request.user.companyId = tenantId;
      request.user.role = user.globalRole;

      return true;
    }

    const userCompany = await this.userCompanyRepository.findOne({
      where: { userId: user.id, companyId: tenantId, isActive: true },
    });

    if (!userCompany) {
      throw new ForbiddenException('No tienes acceso a este espacio de trabajo (Tenant)');
    }

    request.tenantId = tenantId;
    request.tenantRole = userCompany.role;
    
    // Backwards compatibility for existing services/controllers
    request.user.companyId = tenantId;
    request.user.role = userCompany.role;

    return true;
  }
}
