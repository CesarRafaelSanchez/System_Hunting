import { IsString, IsEmail, IsNotEmpty, Length, IsEnum, IsUUID, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 50)
  password: string;

  @IsEnum(['ADMIN', 'BACKOFFICE', 'HUNTER', 'SUPERVISOR_HUNTING', 'SUPERVISOR_VENTAS', 'BACKOFFICE_VENTAS', 'ASESOR_VENTAS', 'POSTVENTA', 'ACCOUNT_ADMIN', 'AGENCY_ADMIN'])
  @IsNotEmpty()
  role: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsEnum(['AGENCY_ADMIN'])
  @IsOptional()
  globalRole?: string;

  @IsString()
  @IsOptional()
  @Length(6, 30)
  phone?: string;

  @IsUUID()
  @IsOptional()
  supervisorId?: string;
}
