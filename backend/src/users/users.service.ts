import { Injectable, OnApplicationBootstrap, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { Company } from '../database/entities/company.entity';
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
  ) {}

  async onApplicationBootstrap() {
    try {
      const userCount = await this.userRepository.count();
      if (userCount === 0) {
        this.logger.log('No users found in database. Initializing initial admin (without company)...');

        // 1. Read env vars
        const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
        const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
        const adminName = process.env.INITIAL_ADMIN_NAME || 'Super Admin';

        if (!adminEmail || !adminPassword) {
          this.logger.warn('INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD are not set in .env! Cannot create initial admin.');
          return;
        }

        // 2. Create admin user (companyId is null)
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = this.userRepository.create({
          companyId: null,
          fullName: adminName,
          email: adminEmail,
          passwordHash: hashedPassword,
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

  async findAll() {
    return this.userRepository.find({
      relations: {
        company: true
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        company: {
          id: true,
          name: true,
          slug: true
        }
      },
      order: {
        role: 'ASC',
        fullName: 'ASC'
      }
    });
  }

  async findOne(id: string) {
    return this.userRepository.findOne({ where: { id } });
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
      passwordHash: hashedPassword,
      role: dto.role,
      companyId: dto.companyId,
      isActive: true
    });
    return this.userRepository.save(user);
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
    user.role = dto.role;
    user.companyId = dto.companyId;

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.userRepository.save(user);
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
