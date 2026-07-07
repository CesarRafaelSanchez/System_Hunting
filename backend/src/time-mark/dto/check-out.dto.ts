import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CheckOutDto {
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @IsNotEmpty({ message: 'La latitud es obligatoria' })
  latitude: number;

  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @IsNotEmpty({ message: 'La longitud es obligatoria' })
  longitude: number;

  @IsString({ message: 'El ID de la foto debe ser texto' })
  @IsNotEmpty({ message: 'La foto de evidencia es obligatoria' })
  photoMediaId: string;
}
