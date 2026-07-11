import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class TransitionStageDto {
  @IsString()
  @IsNotEmpty()
  toStageIdOrCode: string;

  @IsBoolean()
  @IsOptional()
  isValidatedByBO?: boolean;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsOptional()
  form2Data?: any;

  @IsOptional()
  form3Data?: any;

  @IsOptional()
  towersData?: any[];
}
