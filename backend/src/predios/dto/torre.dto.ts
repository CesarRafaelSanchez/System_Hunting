import { IsNotEmpty, IsString, IsNumber, IsOptional, ValidateIf } from 'class-validator';

export class TorreDto {
  @IsString()
  @IsOptional()
  nombreTorre?: string;

  @IsNumber()
  @IsNotEmpty()
  totalPisos: number;

  // Puede ser un número o un string separado por comas (ej: "4,4,4,2")
  @IsNotEmpty()
  hogaresPorPiso: number | string;
}
