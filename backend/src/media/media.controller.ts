import { Controller, Post, Get, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MediaService } from './media.service';
import { AuthGuard } from '@nestjs/passport';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'))
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'), TransactionAuditInterceptor)
  async uploadFile(
    @Request() req: any,
    @UploadedFile() file: any,
    @Body() body: any,
    @TransactionManager() manager: EntityManager
  ) {
    return this.mediaService.uploadFile(req.user, file, body, manager);
  }

  @Get('assets/:entityId')
  async getAssets(@Param('entityId') entityId: string, @Request() req: any) {
    return this.mediaService.getAssetsByEntityId(entityId, req.user.companyId);
  }
}
