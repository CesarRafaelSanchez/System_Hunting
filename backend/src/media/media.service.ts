import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { SimulateUploadDto } from './dto/simulate-upload.dto';
import { MediaAsset } from '../database/entities/media-asset.entity';

@Injectable()
export class MediaService {
  
  async simulateUpload(user: any, dto: SimulateUploadDto, manager: EntityManager) {
    // Simulamos la generación de una URL de almacenamiento y storage key local
    const dummyUrl = `http://localhost:3000/uploads/simulated_${Date.now()}_${dto.fileName}`;
    const dummyKey = `local/simulated_${Date.now()}_${dto.fileName}`;

    const asset = manager.create(MediaAsset, {
      companyId: user.companyId,
      entityType: dto.entityType,
      entityId: dto.entityId,
      uploadedByUserId: user.id,
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      mediaType: dto.mediaType,
      category: dto.category,
      fileSize: dto.fileSize || 1024,
      fileUrl: dummyUrl,
      storageKey: dummyKey,
      latitude: dto.latitude,
      longitude: dto.longitude,
      takenAt: new Date()
    });

    return await manager.save(asset);
  }
}
