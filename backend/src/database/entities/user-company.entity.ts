import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { Team } from './team.entity';

@Entity('user_companies')
@Unique(['userId', 'companyId'])
export class UserCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid', name: 'team_id', nullable: true })
  teamId: string;

  @ManyToOne(() => Team, team => team.userCompanies, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'HUNTER',
  })
  role: string; // 'ACCOUNT_ADMIN' | 'SUPERVISOR_HUNTING' | 'BACKOFFICE' | 'BACKOFFICE_VENTAS' | 'POSTVENTA' | 'HUNTER' | 'SUPERVISOR_VENTAS' | 'ASESOR_VENTAS'

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
