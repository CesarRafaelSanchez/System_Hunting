import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pipeline } from './pipeline.entity';

@Entity('pipeline_stages')
export class PipelineStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'pipeline_id' })
  pipelineId: string;

  @ManyToOne(() => Pipeline)
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 100 })
  code: string;

  @Column({ type: 'int' })
  position: number;

  @Column({ length: 50, name: 'stage_type' })
  stageType: string;

  @Column({ default: false, name: 'is_initial' })
  isInitial: boolean;

  @Column({ default: false, name: 'is_final' })
  isFinal: boolean;

  @Column({ default: false, name: 'is_won' })
  isWon: boolean;

  @Column({ default: false, name: 'is_lost' })
  isLost: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
