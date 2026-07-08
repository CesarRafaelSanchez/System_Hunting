import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { Company } from '../database/entities/company.entity';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    try {
      const usersCount = await this.userRepository.count();
      if (usersCount === 0) {
        this.logger.log('No users found in database. Initializing first super admin...');
        
        // 1. Ensure at least one company exists
        let defaultCompany = await this.companyRepository.findOne({ where: {} });
        if (!defaultCompany) {
          defaultCompany = this.companyRepository.create({
            name: 'Sede Principal',
            slug: 'sede-principal'
          });
          defaultCompany = await this.companyRepository.save(defaultCompany);
          this.logger.log('Created default company: Sede Principal');
        }

        // 2. Read env vars
        const adminEmail = this.configService.get<string>('INITIAL_ADMIN_EMAIL');
        const adminPassword = this.configService.get<string>('INITIAL_ADMIN_PASSWORD');
        const adminName = this.configService.get<string>('INITIAL_ADMIN_NAME') || 'Super Admin';

        if (!adminEmail || !adminPassword) {
          this.logger.warn('INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD are not set in .env! Cannot create initial admin.');
          return;
        }

        // 3. Hash password and create admin
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(adminPassword, salt);

        const admin = this.userRepository.create({
          email: adminEmail,
          fullName: adminName,
          passwordHash: passwordHash,
          role: 'ADMIN',
          companyId: defaultCompany.id,
          isActive: true
        });

        await this.userRepository.save(admin);
        this.logger.log(`Successfully created initial admin: ${adminEmail}`);
      }
    } catch (error) {
      this.logger.error('Error during initial admin setup', error);
    }
  }

  async findAll() {
    return this.userRepository.find({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      order: {
        role: 'ASC',
        fullName: 'ASC'
      }
    });
  }
}
