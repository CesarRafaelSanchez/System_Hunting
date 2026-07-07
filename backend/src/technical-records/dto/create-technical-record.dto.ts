import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateTechnicalRecordDto {
  @IsUUID()
  @IsNotEmpty()
  opportunityId: string;

  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsOptional()
  facadeDescription?: string;

  @IsString()
  @IsOptional()
  mountingDescription?: string;

  @IsString()
  @IsOptional()
  accessDescription?: string;

  @IsString()
  @IsOptional()
  internalRouteDescription?: string;

  @IsString()
  @IsOptional()
  externalRouteDescription?: string;

  @IsString()
  @IsOptional()
  powerAvailability?: string;

  @IsString()
  @IsOptional()
  technicalFeasibility?: string;

  @IsString()
  @IsOptional()
  comments?: string;
}
