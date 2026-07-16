import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Distrito } from './distrito.entity';
import { User } from './user.entity';
import { Torre } from './torre.entity';
import { PropertyContact } from './property-contact.entity';

@Entity('predios')
export class Predio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'text', name: 'nombre_proyecto' })
  nombreProyecto: string;

  @Column({ length: 150, name: 'resultado_visita', nullable: true })
  resultadoVisita: string;

  @Column({ type: 'text', name: 'detalle_visita', nullable: true })
  detalleVisita: string;

  @Column({ type: 'text', name: 'direccion_exacta', nullable: true })
  direccionExacta: string;

  @Column({ length: 80, name: 'tipo_desarrollo' })
  tipoDesarrollo: string;

  @Column({ length: 80, name: 'origen_prospeccion' })
  origenProspeccion: string;

  @Column({ length: 80, name: 'clasificacion_proyecto' })
  clasificacionProyecto: string;

  @Column({ length: 80, name: 'estado_construccion' })
  estadoConstruccion: string;

  @Column({ type: 'date', name: 'fecha_entrega', nullable: true })
  fechaEntrega: Date;

  @Column({ type: 'date', name: 'termino_montantes', nullable: true })
  terminoMontantes: Date;

  @Column({ type: 'date', name: 'termino_mecha', nullable: true })
  terminoMecha: Date;

  @Column({ type: 'date', name: 'termino_fibra_optica', nullable: true })
  terminoFibraOptica: Date;

  @Column({ length: 10, name: 'junta_directiva' })
  juntaDirectiva: string;

  @Column({ type: 'date', name: 'fecha_visita_tecnica', nullable: true })
  fechaVisitaTecnica: Date;

  @Column({ length: 30, name: 'horario_visita', nullable: true })
  horarioVisita: string;

  @Column({ length: 100, default: 'Lima' })
  departamento: string;

  @Column({ length: 100, default: 'Lima' })
  provincia: string;

  @Column({ type: 'uuid', name: 'distrito_id' })
  distritoId: string;

  @ManyToOne(() => Distrito)
  @JoinColumn({ name: 'distrito_id' })
  distrito: Distrito;

  @Column({ type: 'text', name: 'urbanizacion_zona', nullable: true })
  urbanizacionZona: string;

  @Column({ length: 30, name: 'codigo_postal', nullable: true })
  codigoPostal: string;

  @Column({ length: 50, name: 'tipo_via' })
  tipoVia: string;

  @Column({ type: 'text', name: 'nombre_via' })
  nombreVia: string;

  @Column({ length: 50, name: 'numeracion_municipal' })
  numeracionMunicipal: string;

  @Column({ type: 'point', name: 'coordenadas_gps', nullable: true })
  coordenadasGps: string | { x: number, y: number };

  @Column({ type: 'int', default: 1, name: 'total_torres' })
  totalTorres: number;

  @Column({ type: 'int', default: 0, name: 'total_hogares' })
  totalHogares: number;

  @Column({ type: 'int', default: 0, name: 'clientes_interesados' })
  clientesInteresados: number;

  @Column({ type: 'uuid', name: 'hunter_principal_id', nullable: true })
  hunterPrincipalId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'hunter_principal_id' })
  hunterPrincipal: User;

  @OneToMany(() => Torre, torre => torre.predio)
  torres: Torre[];

  @OneToMany(() => PropertyContact, propertyContact => propertyContact.predio)
  propertyContacts: PropertyContact[];

  @Column({ length: 150, nullable: true })
  inmobiliaria: string;

  @Column({ length: 150, nullable: true, name: 'nombre_responsable' })
  nombreResponsable: string;

  @Column({ length: 30, nullable: true, name: 'telefono_responsable' })
  telefonoResponsable: string;

  @Column({ length: 100, nullable: true, name: 'cargo_responsable' })
  cargoResponsable: string;

  @Column({ length: 150, nullable: true, name: 'correo_responsable' })
  correoResponsable: string;

  @Column({ length: 80, nullable: true, name: 'origen_ingreso' })
  ingreso: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
