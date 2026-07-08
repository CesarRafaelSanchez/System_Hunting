import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePredioDto {
  // ── Campos del formulario de Registro de Predio (Génesis) ──────────────────
  // Estos son los campos que envía el formulario frontend del Hunter.

  @IsString()
  @IsNotEmpty()
  nombreEdificio: string; // Nombre del edificio / proyecto

  @IsString()
  @IsNotEmpty()
  direccion: string; // Dirección / nombre de vía

  @IsString()
  @IsNotEmpty()
  distrito: string; // Nombre del distrito (el backend resuelve el UUID)

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
}
