import { Controller, Post, Get, Body, Param, UseGuards, Request, BadRequestException, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { SetupCompanyDto } from './dto/setup-company.dto';
import { Company } from '../database/entities/company.entity';
import { User } from '../database/entities/user.entity';
import { UserCompany } from '../database/entities/user-company.entity';
import { AuthService } from '../auth/auth.service';

@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TransactionAuditInterceptor)
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>
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
    // 1. Validar que el usuario no tenga ya una empresa asociada si no es global
    const existingUc = await manager.findOne(UserCompany, { where: { userId: req.user.id } });
    if (existingUc && req.user.globalRole !== 'AGENCY_ADMIN') {
      throw new BadRequestException('El usuario ya está asociado a una empresa');
    }

    // 2. Validar que no exista una empresa con el mismo RUC o Slug
    const existingCompany = await manager.findOne(Company, {
      where: [
        { ruc: body.ruc },
        { slug: body.slug }
      ]
    });

    if (existingCompany) {
      throw new BadRequestException('Ya existe una empresa con ese RUC o Slug registrado');
    }

    // 3. Crear la empresa
    const company = manager.create(Company, {
      name: body.name,
      ruc: body.ruc,
      slug: body.slug,
      isActive: true
    });
    const savedCompany = await manager.save(company);

    // 4. Asociar el usuario actual a la nueva empresa
    const uc = manager.create(UserCompany, {
      userId: req.user.id,
      companyId: savedCompany.id,
      role: 'ACCOUNT_ADMIN',
      isActive: true
    });
    await manager.save(uc);

    // 5. Refrescar el token del usuario (mantiene globalRole)
    const updatedUserPayload = {
      id: req.user.id,
      email: req.user.email,
      globalRole: req.user.globalRole
    };
    const refreshResult = await this.authService.refresh(updatedUserPayload);

    return {
      message: 'Empresa configurada exitosamente',
      company: savedCompany,
      access_token: refreshResult.access_token,
      user: {
        id: req.user.id,
        email: req.user.email,
        globalRole: req.user.globalRole
      }
    };
  }

  @Get(':id/users')
  async getCompanyUsers(
    @Request() req: any,
    @Param('id') companyId: string
  ) {
    if (req.user.globalRole !== 'AGENCY_ADMIN' && req.user.role !== 'ACCOUNT_ADMIN') {
      throw new BadRequestException('No tienes permisos para ver esta información');
    }
    const ucs = await this.userCompanyRepository.find({
      where: { companyId },
      relations: { user: true }
    });
    
    return ucs.map(uc => ({
      id: uc.user.id,
      email: uc.user.email,
      fullName: uc.user.fullName,
      role: uc.role,
      isActive: uc.isActive,
      createdAt: uc.user.createdAt
    }));
  }

  @Post('admin')
  async createCompanyAdmin(
    @Request() req: any,
    @Body() body: SetupCompanyDto,
    @TransactionManager() manager: EntityManager
  ) {
    if (req.user.globalRole !== 'AGENCY_ADMIN') {
      throw new BadRequestException('No tienes permisos para crear empresas globales');
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
      isActive: true
    });
    const savedCompany = await manager.save(company);

    return {
      message: 'Empresa creada exitosamente por admin global',
      company: savedCompany
    };
  }
}
