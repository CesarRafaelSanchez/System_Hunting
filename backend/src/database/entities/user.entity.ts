import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ length: 150, name: 'full_name' })
  fullName: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ type: 'text', name: 'password_hash' })
  passwordHash: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ length: 50, default: 'HUNTER' })
  role: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'uuid', name: 'supervisor_id', nullable: true })
  supervisorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: User;

  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
