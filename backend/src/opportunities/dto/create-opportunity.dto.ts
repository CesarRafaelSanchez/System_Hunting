import { IsNotEmpty, IsString, IsUUID, IsOptional, IsIn } from 'class-validator';

export class CreateOpportunityDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsUUID()
  @IsNotEmpty()
  leadSourceId: string;

  @IsUUID()
  @IsNotEmpty()
  pipelineId: string;

  @IsString()
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['FUTURA', 'NOVACORE', 'REFERIDO'])
  canalHunting: string;
}
