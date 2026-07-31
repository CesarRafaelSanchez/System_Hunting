import { IsString, IsNotEmpty, Length } from 'class-validator';

export class SetupCompanyDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  ruc: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  slug: string;

  @IsString()
  @IsNotEmpty()
  tipoNegocio?: 'HUNTING_EDIFICIOS' | 'VENTAS_B2B';
}
