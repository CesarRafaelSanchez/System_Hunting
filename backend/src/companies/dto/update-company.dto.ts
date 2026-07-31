import { IsString, IsOptional, Length, IsBoolean } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  @Length(3, 150)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(11, 11)
  ruc?: string;

  @IsString()
  @IsOptional()
  @Length(3, 50)
  slug?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  tipoNegocio?: 'HUNTING_EDIFICIOS' | 'VENTAS_B2B';
}
