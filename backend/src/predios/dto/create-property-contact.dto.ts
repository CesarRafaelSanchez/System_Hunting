import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreatePropertyContactDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  contactType: string;

  @IsString()
  @IsNotEmpty()
  relationshipType: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
