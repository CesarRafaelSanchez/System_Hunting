import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { SimulateUploadDto } from './dto/simulate-upload.dto';
import { MediaAsset } from '../database/entities/media-asset.entity';

@Injectable()
export class MediaService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  
  async simulateUpload(user: any, dto: SimulateUploadDto, file: Express.Multer.File | undefined, manager: EntityManager) {
    const fs = require('fs');
    const path = require('path');
    
    const safeName = dto.fileName || file?.originalname || 'upload';
    const filename = `simulated_${Date.now()}_${safeName.replace(/\s+/g, '_')}`;
    const uploadsPath = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    if (file && file.buffer) {
      fs.writeFileSync(path.join(uploadsPath, filename), file.buffer);
    }

    const fileUrl = `/api/uploads/${filename}`;
    const storageKey = `local/${filename}`;

    const asset = manager.create(MediaAsset, {
      companyId: user.companyId,
      entityType: dto.entityType,
      entityId: dto.entityId,
      uploadedByUserId: user.id,
      fileName: safeName,
      mimeType: dto.mimeType || file?.mimetype || 'application/octet-stream',
      mediaType: dto.mediaType,
      category: dto.category,
      fileSize: dto.fileSize || file?.size || 1024,
      fileUrl: fileUrl,
      storageKey: storageKey,
      latitude: dto.latitude,
      longitude: dto.longitude,
      takenAt: new Date()
    });

    const saved = await manager.save(asset);
    // Return both 'url' (frontend expects this) and 'fileUrl' (DB field) for compatibility
    return { ...saved, url: saved.fileUrl };
  }

  async getAssetsByEntityId(entityId: string, companyId: string) {
    const repo = this.dataSource.getRepository(MediaAsset);
    const assets = await repo.find({
      where: { entityId, companyId },
      order: { takenAt: 'DESC' }
    });
    // Return both url and fileUrl for frontend compatibility, rewriting old localhost:3000 URLs to local proxy paths
    return assets.map(a => {
      let url = a.fileUrl;
      if (url && url.startsWith('http://localhost:3000/uploads/')) {
        url = url.replace('http://localhost:3000/uploads/', '/api/uploads/');
      }
      return { ...a, fileUrl: url, url };
    });
  }
}
