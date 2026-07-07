import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TechnicalRecord } from './technical-record.entity';

@Entity('technical_record_details')
export class TechnicalRecordDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'technical_record_id' })
  technicalRecordId: string;

  @ManyToOne(() => TechnicalRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'technical_record_id' })
  technicalRecord: TechnicalRecord;

  @Column({ type: 'text', name: 'facade_description', nullable: true })
  facadeDescription: string;

  @Column({ type: 'text', name: 'mounting_description', nullable: true })
  mountingDescription: string;

  @Column({ type: 'text', name: 'access_description', nullable: true })
  accessDescription: string;

  @Column({ type: 'text', name: 'internal_route_description', nullable: true })
  internalRouteDescription: string;

  @Column({ type: 'text', name: 'external_route_description', nullable: true })
  externalRouteDescription: string;

  @Column({ length: 50, name: 'power_availability', nullable: true })
  powerAvailability: string;

  @Column({ length: 50, name: 'technical_feasibility', nullable: true })
  technicalFeasibility: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
