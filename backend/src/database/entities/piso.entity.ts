import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Torre } from './torre.entity';

@Entity('pisos')
export class Piso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'torre_id' })
  torreId: string;

  @ManyToOne(() => Torre, torre => torre.pisos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'torre_id' })
  torre: Torre;

  @Column({ type: 'int', name: 'numero_piso' })
  numeroPiso: number;

  @Column({ type: 'int', default: 0, name: 'hogares_cantidad' })
  hogaresCantidad: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
