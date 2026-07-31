import { CanActivate, ExecutionContext, Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserCompany } from '../../database/entities/user-company.entity';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false; // Debe ejecutarse después del JwtAuthGuard
    }

    const tenantIdHeader = request.headers['x-tenant-id'];

    // 1. Bypass para Administradores de la Agencia (Globales)
    if (user.globalRole === 'AGENCY_ADMIN' || user.role === 'AGENCY_ADMIN') {
      const activeTenantId = Array.isArray(tenantIdHeader) ? tenantIdHeader[0] : tenantIdHeader;
      request.tenantId = activeTenantId || null;
      request.user.companyId = activeTenantId || null;
      return true;
    }

    // 2. Usuarios estándar: Requieren cabecera tenant y validación de membresía
    if (!tenantIdHeader) {
      throw new BadRequestException('El header x-tenant-id es requerido para esta ruta');
    }

    const tenantId = Array.isArray(tenantIdHeader) ? tenantIdHeader[0] : tenantIdHeader;

    // Consultar el pivote user_companies para este usuario y esta compañía
    const userCompany = await this.dataSource.getRepository(UserCompany).findOne({
      where: {
        userId: user.id || user.sub,
        companyId: tenantId,
        isActive: true,
      },
    });

    if (!userCompany) {
      throw new ForbiddenException('No tienes acceso a este espacio de trabajo (compañía)');
    }

    // Inyectar el tenant y el rol local a la petición
    request.tenantId = tenantId;
    request.user.companyId = tenantId;
    request.user.role = userCompany.role; // Sobrescribir rol global con el rol específico del tenant

    return true;
  }
}
