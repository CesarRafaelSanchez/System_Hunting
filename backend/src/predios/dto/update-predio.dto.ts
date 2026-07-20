import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistroInicialDto } from './create-registro-inicial.dto';

export class UpdatePredioDto extends PartialType(CreateRegistroInicialDto) {
}
