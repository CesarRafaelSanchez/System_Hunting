import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Opportunity } from './opportunity.entity';
import { PipelineStage } from './pipeline-stage.entity';
import { User } from './user.entity';

@Entity('opportunity_stage_history')
export class OpportunityStageHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'opportunity_id' })
  opportunityId: string;

  @ManyToOne(() => Opportunity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity: Opportunity;

  @Column({ type: 'uuid', name: 'from_stage_id', nullable: true })
  fromStageId: string;

  @ManyToOne(() => PipelineStage)
  @JoinColumn({ name: 'from_stage_id' })
  fromStage: PipelineStage;

  @Column({ type: 'uuid', name: 'to_stage_id' })
  toStageId: string;

  @ManyToOne(() => PipelineStage)
  @JoinColumn({ name: 'to_stage_id' })
  toStage: PipelineStage;

  @Column({ type: 'uuid', name: 'changed_by_user_id' })
  changedByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by_user_id' })
  changedByUser: User;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'changed_at' })
  changedAt: Date;
}
