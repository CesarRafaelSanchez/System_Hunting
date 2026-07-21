import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('pipelines')
export class Pipeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 80, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'uuid', name: 'company_id', nullable: true }) // nullable temporarily for backwards compatibility
  companyId: string;

  @ManyToOne('Company')
  @JoinColumn({ name: 'company_id' })
  company: any; // Using any to avoid circular import if Company isn't imported, or we can just not define the relation if not strictly needed

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
