import { Module } from '@nestjs/common';
import { TimeMarkService } from './time-mark.service';
import { TimeMarkController } from './time-mark.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceSession } from '../database/entities/attendance-session.entity';
import { AttendanceEvent } from '../database/entities/attendance-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceSession, AttendanceEvent])
  ],
  controllers: [TimeMarkController],
  providers: [TimeMarkService],
})
export class TimeMarkModule {}
