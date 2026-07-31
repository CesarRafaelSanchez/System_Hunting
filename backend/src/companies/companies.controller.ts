import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, BadRequestException, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { SetupCompanyDto } from './dto/setup-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from '../database/entities/company.entity';
import { User } from '../database/entities/user.entity';
import { AuthService } from '../auth/auth.service';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@UseInterceptors(TransactionAuditInterceptor)
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Get()
  async findAll() {
    return this.companyRepository.find({
      select: {
        id: true,
        name: true,
        ruc: true,
        slug: true,
        isActive: true
      },
      order: {
        name: 'ASC'
      }
    });
  }

  @Post()
  async setupCompany(
    @Request() req: any,
    @Body() body: SetupCompanyDto,
    @TransactionManager() manager: EntityManager
  ) {
    if (req.user.companyId) {
      throw new BadRequestException('El usuario ya está asociado a una empresa');
    }

    const existingCompany = await manager.findOne(Company, {
      where: [
        { ruc: body.ruc },
        { slug: body.slug }
      ]
    });

    if (existingCompany) {
      throw new BadRequestException('Ya existe una empresa con ese RUC o Slug registrado');
    }

    const company = manager.create(Company, {
      name: body.name,
      ruc: body.ruc,
      slug: body.slug,
      isActive: true,
      tipoNegocio: body.tipoNegocio || 'HUNTING_EDIFICIOS'
    });
    const savedCompany = await manager.save(company);

    await manager.update(User, req.user.id, { companyId: savedCompany.id });

    const updatedUserPayload = {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      companyId: savedCompany.id
    };
    const refreshResult = await this.authService.refresh(updatedUserPayload);

    return {
      message: 'Empresa configurada exitosamente',
      company: savedCompany,
      access_token: refreshResult.access_token,
      user: {
        id: req.user.id,
        fullName: req.user.fullName,
        email: req.user.email,
        companyId: savedCompany.id,
        role: req.user.role
      }
    };
  }

  @Get(':id/users')
  async getCompanyUsers(
    @Request() req: any,
    @Param('id') companyId: string
  ) {
    const isAgencyAdmin = req.user.globalRole === 'AGENCY_ADMIN' || req.user.role === 'AGENCY_ADMIN';
    const isLocalAdmin = req.user.role === 'ACCOUNT_ADMIN' || req.user.role === 'ADMIN';

    if (!isAgencyAdmin && (!isLocalAdmin || req.user.companyId !== companyId)) {
      throw new BadRequestException('No tienes permisos para ver esta información');
    }

    const users = await this.userRepository.find({
      where: { companyId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    return users;
  }

  @Post('admin')
  async createCompanyAdmin(
    @Request() req: any,
    @Body() body: SetupCompanyDto,
    @TransactionManager() manager: EntityManager
  ) {
    const isAgencyAdmin = req.user.globalRole === 'AGENCY_ADMIN' || req.user.role === 'AGENCY_ADMIN';
    if (!isAgencyAdmin) {
      throw new BadRequestException('No tienes permisos para crear empresas');
    }

    const existingCompany = await manager.findOne(Company, {
      where: [
        { ruc: body.ruc },
        { slug: body.slug }
      ]
    });

    if (existingCompany) {
      throw new BadRequestException('Ya existe una empresa con ese RUC o Slug registrado');
    }

    const company = manager.create(Company, {
      name: body.name,
      ruc: body.ruc,
      slug: body.slug,
      isActive: true,
      tipoNegocio: body.tipoNegocio || 'HUNTING_EDIFICIOS'
    });
    const savedCompany = await manager.save(company);

    return {
      message: 'Empresa creada exitosamente',
      company: savedCompany
    };
  }

  @Put(':id')
  async updateCompany(
    @Request() req: any,
    @Param('id') companyId: string,
    @Body() body: UpdateCompanyDto,
    @TransactionManager() manager: EntityManager
  ) {
    const isAgencyAdmin = req.user.globalRole === 'AGENCY_ADMIN' || req.user.role === 'AGENCY_ADMIN';
    if (!isAgencyAdmin) {
      throw new BadRequestException('No tienes permisos para editar empresas');
    }

    const company = await manager.findOne(Company, { where: { id: companyId } });
    if (!company) {
      throw new BadRequestException('Empresa no encontrada');
    }

    if (body.name !== undefined) company.name = body.name;
    if (body.ruc !== undefined) company.ruc = body.ruc;
    if (body.slug !== undefined) company.slug = body.slug;
    if (body.isActive !== undefined) company.isActive = body.isActive;
    if (body.tipoNegocio !== undefined) company.tipoNegocio = body.tipoNegocio;

    const savedCompany = await manager.save(company);
    return {
      message: 'Empresa actualizada exitosamente',
      company: savedCompany
    };
  }
}
