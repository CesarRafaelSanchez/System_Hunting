import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Opportunity } from './opportunity.entity';

@Entity('ventas_fija')
export class VentaFija {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'opportunity_id' })
  opportunityId: string;

  @OneToOne(() => Opportunity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity: Opportunity;

  @Column({ length: 20, nullable: true })
  ruc: string;

  @Column({ length: 200, name: 'razon_social', nullable: true })
  razonSocial: string;

  @Column({ length: 200, name: 'representante_legal', nullable: true })
  representanteLegal: string;

  @Column({ length: 20, name: 'dni_rrll', nullable: true })
  dniRrll: string;

  @Column({ length: 30, name: 'celular_rrll', nullable: true })
  celularRrll: string;

  @Column({ length: 150, name: 'correo_electronico', nullable: true })
  correoElectronico: string;

  @Column({ length: 200, name: 'nombre_padres_rrll', nullable: true })
  nombrePadresRrll: string;

  @Column({ length: 50, name: 'fecha_nacimiento_rrll', nullable: true })
  fechaNacimientoRrll: string;

  @Column({ length: 100, name: 'lugar_nacimiento_rrll', nullable: true })
  lugarNacimientoRrll: string;

  @Column({ length: 50, name: 'tipo_domicilio', nullable: true, default: 'Casa' })
  tipoDomicilio: string;

  @Column({ type: 'text', name: 'direccion_fiscal', nullable: true })
  direccionFiscal: string;

  @Column({ type: 'text', name: 'direccion_instalacion', nullable: true })
  direccionInstalacion: string;

  @Column({ length: 100, nullable: true })
  departamento: string;

  @Column({ length: 100, nullable: true })
  provincia: string;

  @Column({ length: 100, nullable: true })
  distrito: string;

  @Column({ type: 'text', nullable: true })
  referencia: string;

  @Column({ type: 'jsonb', name: 'coordenadas_gps', nullable: true })
  coordenadasGps: { x: number; y: number } | null;

  @Column({ length: 50, name: 'tipo_tecnologia', nullable: true })
  tipoTecnologia: string; // 'FTTH' | 'HFC'

  @Column({ length: 50, name: 'tipo_play', nullable: true })
  tipoPlay: string; // '1Play' | '2Play' | '3Play'

  @Column({ length: 100, nullable: true })
  velocidad: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'cargo_fijo_sin_igv', nullable: true })
  cargoFijoSinIgv: number;

  @Column({ length: 150, nullable: true })
  campana: string;

  @Column({ type: 'text', nullable: true })
  adicionales: string;

  @Column({ length: 50, name: 'tipo_servicio', nullable: true, default: 'Fija' })
  tipoServicio: string; // 'Fija' | 'Movil'

  @Column({ type: 'int', name: 'cantidad_lineas', nullable: true })
  cantidadLineas: number;

  @Column({ length: 100, name: 'tipo_movil', nullable: true })
  tipoMovil: string; // 'Alta' | 'Portabilidad'

  @Column({ length: 255, name: 'plano_url', nullable: true })
  planoUrl: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'text', name: 'notas_postventa', nullable: true })
  notasPostventa: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
