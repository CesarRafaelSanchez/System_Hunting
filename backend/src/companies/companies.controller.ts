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
    // 1. Validar que el usuario no tenga ya una empresa asociada
    if (req.user.companyId) {
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
    await manager.update(User, req.user.id, { companyId: savedCompany.id });

    // 5. Refrescar el token del usuario con el nuevo companyId
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
    if (req.user.role !== 'ADMIN') {
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
    if (req.user.role !== 'ADMIN') {
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
      isActive: true
    });
    const savedCompany = await manager.save(company);

    return {
      message: 'Empresa creada exitosamente',
      company: savedCompany
    };
  }
}
