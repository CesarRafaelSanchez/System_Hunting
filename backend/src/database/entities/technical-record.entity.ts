import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Opportunity } from './opportunity.entity';
import { Predio } from './predio.entity';
import { User } from './user.entity';

@Entity('technical_records')
export class TechnicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid', name: 'opportunity_id' })
  opportunityId: string;

  @ManyToOne(() => Opportunity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity: Opportunity;

  @Column({ type: 'uuid', name: 'property_id' })
  propertyId: string;

  @ManyToOne(() => Predio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Predio;

  @Column({ length: 50, default: 'PENDING' })
  status: string;

  @Column({ type: 'uuid', name: 'completed_by_user_id', nullable: true })
  completedByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'completed_by_user_id' })
  completedByUser: User;

  @Column({ type: 'uuid', name: 'validated_by_user_id', nullable: true })
  validatedByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'validated_by_user_id' })
  validatedByUser: User;

  @Column({ type: 'uuid', name: 'sent_to_win_by_user_id', nullable: true })
  sentToWinByUserId: string;

  @Column({ type: 'timestamptz', name: 'validated_at', nullable: true })
  validatedAt: Date;

  @Column({ type: 'timestamptz', name: 'sent_to_win_at', nullable: true })
  sentToWinAt: Date;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
