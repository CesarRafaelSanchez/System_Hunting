import { Injectable, OnApplicationBootstrap, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
  ) {}

  async onApplicationBootstrap() {
    try {
      const userCount = await this.userRepository.count();
      if (userCount === 0) {
        this.logger.log('No users found in database. Initializing initial admin...');

        const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
        const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
        const adminName = process.env.INITIAL_ADMIN_NAME || 'Super Admin';

        if (!adminEmail || !adminPassword) {
          this.logger.warn('INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD are not set in .env! Cannot create initial admin.');
          return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = this.userRepository.create({
          globalRole: 'AGENCY_ADMIN',
          fullName: adminName,
          email: adminEmail,
          passwordHash: hashedPassword,
          isActive: true,
        });

        await this.userRepository.save(admin);
        this.logger.log(`Initial admin created successfully: ${adminEmail}`);
      }
    } catch (e) {
      this.logger.error('Error creating initial admin during bootstrap', e);
    }
  }

  async findAll() {
    // Para simplificar la refactorización actual en el frontend, mapeamos el primer UserCompany como si fuera 'company'
    const users = await this.userRepository.find({
      relations: {
        userCompanies: {
          company: true
        }
      },
      order: {
        fullName: 'ASC'
      }
    });

    return users.map(user => {
      const uc = user.userCompanies && user.userCompanies.length > 0 ? user.userCompanies[0] : null;
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.globalRole || (uc ? uc.role : null),
        globalRole: user.globalRole,
        isActive: user.isActive,
        createdAt: user.createdAt,
        company: uc ? {
          id: uc.company.id,
          name: uc.company.name,
          slug: uc.company.slug
        } : null
      };
    });
  }

  async findOne(id: string) {
    return this.userRepository.findOne({ where: { id }, relations: { userCompanies: { company: true } } });
  }

  async getUserWorkspaces(user: any) {
    if (user.globalRole === 'AGENCY_ADMIN' || user.globalRole === 'AGENCY_SUPPORT') {
      const companies = await this.companyRepository.find({ where: { isActive: true } });
      return companies.map(c => ({
        companyId: c.id,
        name: c.name,
        slug: c.slug,
        role: user.globalRole // For global users, their role in any company is their global role
      }));
    }

    const ucs = await this.userCompanyRepository.find({
      where: { userId: user.id, isActive: true },
      relations: ['company']
    });

    return ucs.map(uc => ({
      companyId: uc.companyId,
      name: uc.company.name,
      slug: uc.company.slug,
      role: uc.role
    }));
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('El correo ya está registrado por otro usuario');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passwordHash: hashedPassword,
      globalRole: dto.globalRole,
      isActive: true
    });
    const savedUser = await this.userRepository.save(user);

    if (dto.companyId && dto.role && !dto.globalRole) {
      const userCompany = this.userCompanyRepository.create({
        userId: savedUser.id,
        companyId: dto.companyId,
        role: dto.role,
        isActive: true
      });
      await this.userCompanyRepository.save(userCompany);
    }

    return savedUser;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing && existing.id !== id) {
      throw new BadRequestException('El correo ya está registrado por otro usuario');
    }

    user.fullName = dto.fullName;
    user.email = dto.email;
    if (dto.phone !== undefined) {
      user.phone = dto.phone;
    }
    if (dto.globalRole !== undefined) {
      user.globalRole = dto.globalRole;
    }
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    await this.userRepository.save(user);

    if (dto.companyId && dto.role) {
      let uc = await this.userCompanyRepository.findOne({ where: { userId: id, companyId: dto.companyId } });
      if (uc) {
        uc.role = dto.role;
        await this.userCompanyRepository.save(uc);
      } else {
        uc = this.userCompanyRepository.create({
          userId: id,
          companyId: dto.companyId,
          role: dto.role,
          isActive: true
        });
        await this.userCompanyRepository.save(uc);
      }
    }

    return user;
  }

  async toggleStatus(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
  }
}
