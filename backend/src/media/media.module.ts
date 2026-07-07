import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaAsset } from '../database/entities/media-asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MediaAsset
    ])
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
