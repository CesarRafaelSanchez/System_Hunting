import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Opportunity } from './opportunity.entity';
import { Predio } from './predio.entity';
import { User } from './user.entity';

@Entity('incidents')
export class Incident {
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

  @Column({ length: 80, name: 'incident_type' })
  incidentType: string;

  @Column({ length: 50, default: 'OPEN' })
  status: string;

  @Column({ length: 30 })
  severity: string;

  @Column({ type: 'uuid', name: 'reported_by_user_id' })
  reportedByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by_user_id' })
  reportedByUser: User;

  @Column({ type: 'uuid', name: 'assigned_to_user_id', nullable: true })
  assignedToUserId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', name: 'resolution_detail', nullable: true })
  resolutionDetail: string;

  @Column({ type: 'timestamptz', name: 'reported_at', default: () => 'CURRENT_TIMESTAMP' })
  reportedAt: Date;

  @Column({ type: 'timestamptz', name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
