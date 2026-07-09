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

  @IsEnum(['ADMIN', 'BACKOFFICE', 'HUNTER'])
  @IsNotEmpty()
  role: string;

  @IsUUID()
  @IsNotEmpty()
  companyId: string;
}
