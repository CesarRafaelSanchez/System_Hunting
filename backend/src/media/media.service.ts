import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { MediaAsset } from '../database/entities/media-asset.entity';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class MediaService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async uploadFile(user: any, file: any, body: any, manager: EntityManager) {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo');
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileExt = path.extname(file.originalname);
    const uniqueFileName = `${randomUUID()}${fileExt}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await fs.promises.writeFile(filePath, file.buffer);

    const fileUrl = `/api/uploads/${uniqueFileName}`;
    const storageKey = `local/${uniqueFileName}`;

    const entityType = body.entityType || 'GENERAL';
    const entityId = body.entityId || randomUUID();
    const category = body.category || 'GENERAL';
    const mediaType = body.mediaType || 'IMAGE';
    const latitude = body.latitude ? parseFloat(body.latitude) : null;
    const longitude = body.longitude ? parseFloat(body.longitude) : null;

    const asset = manager.create(MediaAsset, {
      companyId: user.companyId || '',
      entityType,
      entityId,
      uploadedByUserId: user.id,
      fileName: file.originalname,
      mimeType: file.mimetype,
      mediaType,
      category,
      fileSize: file.size,
      fileUrl,
      storageKey,
      latitude,
      longitude,
      takenAt: new Date()
    } as any);

    const savedAsset = await manager.save(asset);
    return {
      ...savedAsset,
      url: savedAsset.fileUrl
    };
  }

  async getAssetsByEntityId(entityId: string, companyId: string) {
    const repo = this.dataSource.getRepository(MediaAsset);
    const whereClause: any = { entityId };
    if (companyId) {
      whereClause.companyId = companyId;
    }
    const assets = await repo.find({
      where: whereClause,
      order: { takenAt: 'DESC' }
    });
    // Return both url and fileUrl for frontend compatibility
    // Rewriting old absolute URLs if a BACKEND_URL is provided, or just returning as is
    return assets.map(a => {
      let url = a.fileUrl;
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      if (url && url.startsWith(`${backendUrl}/uploads/`)) {
        url = url.replace(`${backendUrl}/uploads/`, '/api/uploads/');
      } else if (url && url.startsWith('http://localhost:3000/uploads/')) {
        // Fallback catch for legacy hardcoded data
        url = url.replace('http://localhost:3000/uploads/', '/api/uploads/');
      }
      return { ...a, fileUrl: url, url };
    });
  }
}
