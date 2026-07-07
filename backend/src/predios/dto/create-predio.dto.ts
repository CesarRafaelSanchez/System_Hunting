import { IsNotEmpty, IsString, IsOptional, IsDateString, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { TorreDto } from './torre.dto';

export class CreatePredioDto {
  @IsString()
  @IsNotEmpty()
  nombreProyecto: string;

  @IsString()
  @IsNotEmpty()
  tipoDesarrollo: string;

  @IsString()
  @IsNotEmpty()
  origenProspeccion: string;

  @IsString()
  @IsNotEmpty()
  clasificacionProyecto: string;

  @IsString()
  @IsNotEmpty()
  estadoConstruccion: string;

  @IsDateString()
  @IsOptional()
  fechaEntrega?: string;

  @IsString()
  @IsNotEmpty()
  juntaDirectiva: string;

  @IsString()
  @IsNotEmpty()
  distritoId: string;

  @IsString()
  @IsNotEmpty()
  tipoVia: string;

  @IsString()
  @IsNotEmpty()
  nombreVia: string;

  @IsString()
  @IsNotEmpty()
  numeracionMunicipal: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TorreDto)
  torresEstructura: TorreDto[];
}
