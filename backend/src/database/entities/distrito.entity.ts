import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('distritos')
export class Distrito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  nombre: string;
}
