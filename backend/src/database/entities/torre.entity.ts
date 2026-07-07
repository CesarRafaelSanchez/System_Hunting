import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Predio } from './predio.entity';
import { Piso } from './piso.entity';

@Entity('torres')
export class Torre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'predio_id' })
  predioId: string;

  @ManyToOne(() => Predio, predio => predio.torres, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'predio_id' })
  predio: Predio;

  @Column({ type: 'text', name: 'nombre_torre' })
  nombreTorre: string;

  @OneToMany(() => Piso, piso => piso.torre)
  pisos: Piso[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
