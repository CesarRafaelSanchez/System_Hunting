import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AttendanceSession } from './attendance-session.entity';
import { User } from './user.entity';

@Entity('attendance_events')
export class AttendanceEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'attendance_session_id' })
  attendanceSessionId: string;

  @ManyToOne(() => AttendanceSession)
  @JoinColumn({ name: 'attendance_session_id' })
  attendanceSession: AttendanceSession;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 50, name: 'event_type' })
  eventType: string; // 'CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END'

  // Utilizando el tipo point nativo de Postgres, en TypeORM se maneja como string o a través de PostGIS si usamos geometry.
  // En este caso el db_schema.sql usa POINT. TypeORM lo lee como { x: number, y: number } o un string "(x,y)".
  @Column({ type: 'point' })
  coordenada: string | { x: number, y: number };

  @Column({ type: 'uuid', name: 'photo_media_id' })
  photoMediaId: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
