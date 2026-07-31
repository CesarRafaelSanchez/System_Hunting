import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateRegistroInicialDto {
  // ── Campos del formulario de Registro de Predio (Génesis) ──────────────────
  // Estos son los campos que envía el formulario frontend del Hunter.

  @IsString()
  @IsOptional()
  ejecutivo?: string; // Hunter que registra el predio

  @IsString()
  @IsNotEmpty()
  nombreProyecto: string; // Nombre del edificio / proyecto

  @IsString()
  @IsNotEmpty()
  direccion: string; // Dirección / nombre de vía

  @IsString()
  @IsNotEmpty()
  distrito: string; // Nombre del distrito (el backend resuelve el UUID)

  @IsString()
  @IsOptional()
  departamento?: string; // Departamento (e.g. Lima)

  @IsString()
  @IsOptional()
  provincia?: string; // Provincia (e.g. Lima)

  @IsString()
  @IsOptional()
  numeroHPs?: string; // Número de hogares pasantes

  @IsString()
  @IsOptional()
  resultadoVisita?: string; // Resultado de la visita

  @IsString()
  @IsOptional()
  detalle?: string; // Detalle de la visita

  @IsString()
  @IsOptional()
  coordenadas?: string; // Coordenadas GPS "lat, lng"

  // ── Campos avanzados opcionales (usados en fases posteriores) ─────────────
  @IsString()
  @IsOptional()
  tipoDesarrollo?: string;

  @IsString()
  @IsOptional()
  origenProspeccion?: string;

  @IsString()
  @IsOptional()
  clasificacionProyecto?: string;

  @IsString()
  @IsOptional()
  estadoConstruccion?: string;

  @IsString()
  @IsOptional()
  juntaDirectiva?: string;

  @IsString()
  @IsOptional()
  tipoVia?: string;

  @IsString()
  @IsOptional()
  numeracionMunicipal?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  // ── Campos usados por UpdatePredioDto (fases avanzadas del formulario) ──────
  @IsString()
  @IsOptional()
  fechaEntrega?: string;

  @IsOptional()
  torresEstructura?: any[];

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  initialStageCode?: string;

  @IsOptional()
  isReferral?: boolean;

  @IsString()
  @IsOptional()
  referredHunterName?: string;

  @IsString()
  @IsOptional()
  partnerSupervisorId?: string;

  // B2B Sales Fields
  @IsString()
  @IsOptional()
  ruc?: string;

  @IsString()
  @IsOptional()
  razonSocial?: string;

  @IsString()
  @IsOptional()
  representanteLegal?: string;

  @IsString()
  @IsOptional()
  dniRrll?: string;

  @IsString()
  @IsOptional()
  celularRrll?: string;

  @IsString()
  @IsOptional()
  correoElectronico?: string;

  @IsString()
  @IsOptional()
  direccionInstalacion?: string;

  @IsString()
  @IsOptional()
  tipoTecnologia?: string;

  @IsString()
  @IsOptional()
  tipoPlay?: string;

  @IsOptional()
  cargoFijoSinIgv?: number | string;
}
