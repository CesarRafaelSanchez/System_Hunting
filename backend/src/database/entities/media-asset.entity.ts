import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('media_assets')
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ length: 80, name: 'entity_type' })
  entityType: string;

  @Column({ type: 'uuid', name: 'entity_id' })
  entityId: string;

  @Column({ type: 'uuid', name: 'uploaded_by_user_id' })
  uploadedByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploadedByUser: User;

  @Column({ length: 255, name: 'file_name' })
  fileName: string;

  @Column({ type: 'text', name: 'file_url' })
  fileUrl: string;

  @Column({ type: 'text', name: 'storage_key' })
  storageKey: string;

  @Column({ length: 100, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'int', name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ length: 50, name: 'media_type' })
  mediaType: string;

  @Column({ length: 80 })
  category: string;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'timestamptz', name: 'taken_at', nullable: true })
  takenAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
