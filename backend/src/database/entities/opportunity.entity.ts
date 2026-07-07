import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Predio } from './predio.entity';
import { LeadSource } from './lead-source.entity';
import { Pipeline } from './pipeline.entity';
import { PipelineStage } from './pipeline-stage.entity';
import { User } from './user.entity';

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid', name: 'property_id' })
  propertyId: string;

  @ManyToOne(() => Predio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Predio;

  @Column({ type: 'uuid', name: 'lead_source_id' })
  leadSourceId: string;

  @ManyToOne(() => LeadSource)
  @JoinColumn({ name: 'lead_source_id' })
  leadSource: LeadSource;

  @Column({ type: 'uuid', name: 'pipeline_id' })
  pipelineId: string;

  @ManyToOne(() => Pipeline)
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;

  @Column({ type: 'uuid', name: 'current_stage_id' })
  currentStageId: string;

  @ManyToOne(() => PipelineStage)
  @JoinColumn({ name: 'current_stage_id' })
  currentStage: PipelineStage;

  @Column({ type: 'uuid', name: 'current_owner_user_id', nullable: true })
  currentOwnerUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'current_owner_user_id' })
  currentOwnerUser: User;

  @Column({ type: 'uuid', name: 'created_by_user_id' })
  createdByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: User;

  @Column({ length: 50, default: 'OPEN' })
  status: string;

  @Column({ length: 30, nullable: true })
  priority: string;

  @Column({ length: 50, name: 'canal_hunting' })
  canalHunting: string;

  @Column({ type: 'text', name: 'motivo_cierre', nullable: true })
  motivoCierre: string;

  @Column({ type: 'timestamptz', name: 'current_stage_entered_at' })
  currentStageEnteredAt: Date;

  @Column({ type: 'timestamptz', name: 'last_activity_at', nullable: true })
  lastActivityAt: Date;

  @Column({ type: 'timestamptz', name: 'won_at', nullable: true })
  wonAt: Date;

  @Column({ type: 'timestamptz', name: 'lost_at', nullable: true })
  lostAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
