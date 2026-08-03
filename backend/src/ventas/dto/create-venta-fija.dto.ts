import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateVentaFijaDto {
  @IsString()
  @IsNotEmpty()
  ruc: string;

  @IsString()
  @IsNotEmpty()
  razonSocial: string;

  @IsString()
  @IsNotEmpty()
  representanteLegal: string;

  @IsString()
  @IsNotEmpty()
  dniRrll: string;

  @IsString()
  @IsNotEmpty()
  celularRrll: string;

  @IsString()
  @IsNotEmpty()
  correoElectronico: string;

  @IsString()
  @IsNotEmpty()
  direccionInstalacion: string;

  @IsString()
  @IsNotEmpty()
  tipoTecnologia: string;

  @IsString()
  @IsNotEmpty()
  tipoPlay: string;

  @IsNotEmpty()
  cargoFijoSinIgv: number | string;

  @IsString()
  @IsOptional()
  distrito?: string;

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  initialStageCode?: string;

  @IsString()
  @IsOptional()
  nombrePadresRrll?: string;

  @IsString()
  @IsOptional()
  fechaNacimientoRrll?: string;

  @IsString()
  @IsOptional()
  lugarNacimientoRrll?: string;

  @IsString()
  @IsOptional()
  tipoDomicilio?: string;

  @IsString()
  @IsOptional()
  direccionFiscal?: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsOptional()
  provincia?: string;

  @IsString()
  @IsOptional()
  referencia?: string;

  @IsOptional()
  coordenadas?: string; // We'll map this to coordenadasGps in the service

  @IsString()
  @IsOptional()
  velocidad?: string;

  @IsString()
  @IsOptional()
  campana?: string;

  @IsString()
  @IsOptional()
  adicionales?: string;

  @IsString()
  @IsOptional()
  tipoServicio?: string;

  @IsOptional()
  cantidadLineas?: number | string;

  @IsString()
  @IsOptional()
  tipoMovil?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  planoUrl?: string;
}
