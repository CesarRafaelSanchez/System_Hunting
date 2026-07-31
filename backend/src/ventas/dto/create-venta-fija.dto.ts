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
  companyId?: string;

  @IsString()
  @IsOptional()
  initialStageCode?: string;
}
