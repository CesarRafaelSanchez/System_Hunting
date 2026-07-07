import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('attendance_sessions')
export class AttendanceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', name: 'work_date' })
  workDate: string;

  @Column({ length: 50 })
  status: string; // 'OPEN', 'CLOSED', 'INCOMPLETE', 'OBSERVED', 'APPROVED'

  @Column({ type: 'timestamptz', name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamptz', name: 'ended_at', nullable: true })
  endedAt: Date;

  @Column({ type: 'numeric', precision: 10, scale: 7, name: 'start_latitude', nullable: true })
  startLatitude: number;

  @Column({ type: 'numeric', precision: 10, scale: 7, name: 'start_longitude', nullable: true })
  startLongitude: number;

  @Column({ type: 'numeric', precision: 10, scale: 7, name: 'end_latitude', nullable: true })
  endLatitude: number;

  @Column({ type: 'numeric', precision: 10, scale: 7, name: 'end_longitude', nullable: true })
  endLongitude: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
