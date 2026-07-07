import { IsNotEmpty, IsString, IsUUID, IsIn, IsOptional } from 'class-validator';

export class CreateIncidentDto {
  @IsUUID()
  @IsNotEmpty()
  opportunityId: string;

  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  incidentType: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateIncidentUpdateDto {
  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsString()
  @IsOptional()
  nextAction?: string;

  @IsString()
  @IsOptional()
  nextFollowUpDate?: string;
}
