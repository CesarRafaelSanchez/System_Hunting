import { Injectable, OnApplicationBootstrap, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { Company } from '../database/entities/company.entity';
import { UserCompany } from '../database/entities/user-company.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    try {
      const userCount = await this.userRepository.count();
      if (userCount === 0) {
        this.logger.log('No users found in database. Initializing initial admin (without company)...');

        const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
        const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
        const adminName = process.env.INITIAL_ADMIN_NAME || 'Super Admin';

        if (!adminEmail || !adminPassword) {
          this.logger.warn('INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD are not set in .env! Cannot create initial admin.');
          return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = this.userRepository.create({
          companyId: null,
          fullName: adminName,
          email: adminEmail,
          passwordHash: hashedPassword,
          globalRole: 'AGENCY_ADMIN',
          role: 'ADMIN',
          isActive: true,
        });

        await this.userRepository.save(admin);
        this.logger.log(`Initial admin created successfully: ${adminEmail}`);
      }
    } catch (e) {
      this.logger.error('Error creating initial admin during bootstrap', e);
    }
  }

  async findAll(currentUser: any) {
    const isAgencyAdmin = currentUser.globalRole === 'AGENCY_ADMIN' || currentUser.role === 'AGENCY_ADMIN';
    if (isAgencyAdmin) {
      const allUsers = await this.userRepository.find({
        relations: { company: true, supervisor: true },
        order: { fullName: 'ASC' }
      });
      return allUsers;
    }

    const userCompanies = await this.dataSource.getRepository(UserCompany).find({
      where: { companyId: currentUser.companyId },
      relations: { user: { company: true, supervisor: true } },
    });

    return userCompanies.map(uc => {
      const u = uc.user;
      u.role = uc.role; // Sobrescribir rol local para el frontend
      return u;
    });
  }

  async findOne(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(dto: CreateUserDto, currentUser: any) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('El correo ya está registrado por otro usuario');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const isCurrentUserAgencyAdmin = currentUser.globalRole === 'AGENCY_ADMIN' || currentUser.role === 'AGENCY_ADMIN';
    const targetCompanyId = isCurrentUserAgencyAdmin ? (dto.companyId || null) : currentUser.companyId;
    const targetGlobalRole = (isCurrentUserAgencyAdmin && dto.globalRole === 'AGENCY_ADMIN') ? 'AGENCY_ADMIN' : null;

    const user: User = this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passwordHash: hashedPassword,
      role: dto.role, // legacy compat
      globalRole: targetGlobalRole,
      companyId: targetCompanyId, // legacy compat
      supervisorId: dto.supervisorId || null,
      isActive: true
    });

    const savedUser = await this.userRepository.save(user);

    // Crear membresía pivote
    if (targetCompanyId) {
      const userCompany = this.dataSource.getRepository(UserCompany).create({
        userId: savedUser.id,
        companyId: targetCompanyId,
        role: dto.role,
        isActive: true
      });
      await this.dataSource.getRepository(UserCompany).save(userCompany);
    }

    return savedUser;
  }

  async update(id: string, dto: UpdateUserDto, currentUser: any) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing && existing.id !== id) {
      throw new BadRequestException('El correo ya está registrado por otro usuario');
    }

    const isAgencyAdmin = currentUser.globalRole === 'AGENCY_ADMIN' || currentUser.role === 'AGENCY_ADMIN';
    const targetCompanyId = isAgencyAdmin ? (dto.companyId || null) : currentUser.companyId;
    const targetGlobalRole = (isAgencyAdmin && dto.globalRole === 'AGENCY_ADMIN') ? 'AGENCY_ADMIN' : null;

    // Si no es admin global, verificar que el usuario a editar pertenezca a la misma empresa
    if (!isAgencyAdmin) {
      const userCompany = await this.dataSource.getRepository(UserCompany).findOne({
        where: { userId: id, companyId: currentUser.companyId }
      });
      if (!userCompany) {
        throw new ForbiddenException('No tienes permisos para editar este usuario');
      }
    }

    user.fullName = dto.fullName;
    user.email = dto.email;
    if (dto.phone !== undefined) {
      user.phone = dto.phone;
    }
    user.role = dto.role;
    user.globalRole = targetGlobalRole;
    user.companyId = targetCompanyId;
    user.supervisorId = dto.supervisorId || null;

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const savedUser = await this.userRepository.save(user);

    // Actualizar membresía pivote
    if (targetCompanyId) {
      let userCompany = await this.dataSource.getRepository(UserCompany).findOne({
        where: { userId: id, companyId: targetCompanyId }
      });
      if (!userCompany) {
        userCompany = this.dataSource.getRepository(UserCompany).create({
          userId: id,
          companyId: targetCompanyId,
          role: dto.role,
          isActive: true
        });
      } else {
        userCompany.role = dto.role;
      }
      await this.dataSource.getRepository(UserCompany).save(userCompany);
    }

    return savedUser;
  }

  async toggleStatus(id: string, currentUser: any) {
    const isAgencyAdmin = currentUser.globalRole === 'AGENCY_ADMIN' || currentUser.role === 'AGENCY_ADMIN';
    
    if (!isAgencyAdmin) {
      const userCompany = await this.dataSource.getRepository(UserCompany).findOne({
        where: { userId: id, companyId: currentUser.companyId }
      });
      if (!userCompany) {
        throw new ForbiddenException('No tienes permisos sobre este usuario');
      }
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
  }
}
