import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 80, unique: true })
  slug: string;

  @Column({ length: 20, nullable: true })
  ruc: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ length: 50, name: 'tipo_negocio', default: 'HUNTING_EDIFICIOS' })
  tipoNegocio: string; // 'HUNTING_EDIFICIOS' | 'VENTAS_B2B'

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
