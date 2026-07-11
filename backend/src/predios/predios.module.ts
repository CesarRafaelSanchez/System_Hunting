import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrediosService } from './predios.service';
import { PrediosController } from './predios.controller';
import { Predio } from '../database/entities/predio.entity';
import { Torre } from '../database/entities/torre.entity';
import { Piso } from '../database/entities/piso.entity';
import { Contact } from '../database/entities/contact.entity';
import { PropertyContact } from '../database/entities/property-contact.entity';
import { Distrito } from '../database/entities/distrito.entity';
import { Opportunity } from '../database/entities/opportunity.entity';

import { OpportunitiesModule } from '../opportunities/opportunities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Predio,
      Torre,
      Piso,
      Contact,
      PropertyContact,
      Distrito,
      Opportunity
    ]),
    OpportunitiesModule
  ],
  controllers: [PrediosController],
  providers: [PrediosService],
  exports: [PrediosService],
})
export class PrediosModule {}
