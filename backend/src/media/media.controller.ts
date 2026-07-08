import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MediaService } from './media.service';
import { SimulateUploadDto } from './dto/simulate-upload.dto';
import { AuthGuard } from '@nestjs/passport';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';


@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TransactionAuditInterceptor)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req: any,
    @UploadedFile() file: any,
    @Body() body: any,
    @TransactionManager() manager: EntityManager
  ) {
    return this.mediaService.uploadFile(req.user, file, body, manager);
  }
}
