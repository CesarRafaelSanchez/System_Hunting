import { Controller, Post, Get, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { SimulateUploadDto } from './dto/simulate-upload.dto';
import { AuthGuard } from '@nestjs/passport';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';

@UseGuards(AuthGuard('jwt'))
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'), TransactionAuditInterceptor)
  async simulateUpload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @TransactionManager() manager: EntityManager
  ) {
    // Build the DTO from multipart form fields + file metadata
    const dto: SimulateUploadDto = {
      entityType: body.entityType || 'OPPORTUNITY',
      entityId: body.entityId,
      fileName: file?.originalname || body.fileName || 'upload',
      mimeType: file?.mimetype || body.mimeType || 'application/octet-stream',
      mediaType: body.mediaType || (file?.mimetype?.startsWith('image/') ? 'IMAGE' : 'DOCUMENT'),
      category: body.category || 'FACHADA',
      fileSize: file?.size || parseInt(body.fileSize, 10) || 0,
    };
    return this.mediaService.simulateUpload(req.user, dto, file, manager);
  }

  @Get('assets/:entityId')
  async getAssets(@Param('entityId') entityId: string, @Request() req: any) {
    return this.mediaService.getAssetsByEntityId(entityId, req.user.companyId);
  }
}
