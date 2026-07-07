import { PartialType } from '@nestjs/mapped-types';
import { CreatePredioDto } from './create-predio.dto';

export class UpdatePredioDto extends PartialType(CreatePredioDto) {}
