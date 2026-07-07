import { Controller, Post, Body, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { MediaService } from './media.service';
import { SimulateUploadDto } from './dto/simulate-upload.dto';
import { AuthGuard } from '@nestjs/passport';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';

@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TransactionAuditInterceptor)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  async simulateUpload(
    @Request() req: any,
    @Body() dto: SimulateUploadDto,
    @TransactionManager() manager: EntityManager
  ) {
    return this.mediaService.simulateUpload(req.user, dto, manager);
  }
}
