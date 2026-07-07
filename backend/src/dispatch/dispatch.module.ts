import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SheetsService } from './sheets.service';

@Module({
  providers: [EmailService, SheetsService],
  exports: [EmailService, SheetsService],
})
export class DispatchModule {}
