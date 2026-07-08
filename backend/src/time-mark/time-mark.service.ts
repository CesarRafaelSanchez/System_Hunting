import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In } from 'typeorm';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AttendanceSession } from '../database/entities/attendance-session.entity';
import { AttendanceEvent } from '../database/entities/attendance-event.entity';
import { MediaAsset } from '../database/entities/media-asset.entity';

@Injectable()
export class TimeMarkService {
  constructor(
    @InjectEntityManager()
    private readonly globalManager: EntityManager
  ) {}

  private getManager(manager?: EntityManager): EntityManager {
    return manager || this.globalManager;
  }

  async checkIn(user: any, checkInDto: CheckInDto, manager?: EntityManager) {
    const activeManager = this.getManager(manager);
    const today = new Date().toISOString().split('T')[0];

    // Verificar si ya existe una sesión abierta o completada hoy
    const existingSession = await activeManager.findOne(AttendanceSession, {
      where: { userId: user.id, workDate: today }
    });

    if (existingSession) {
      throw new BadRequestException('Ya existe una sesión de asistencia registrada para hoy');
    }

    // Crear la sesión
    const session = activeManager.create(AttendanceSession, {
      companyId: user.companyId,
      userId: user.id,
      workDate: today,
      status: 'OPEN',
      startedAt: new Date(),
      startLatitude: checkInDto.latitude,
      startLongitude: checkInDto.longitude,
    });

    const savedSession = await activeManager.save(session);

    // Crear el evento de Clock In
    const event = activeManager.create(AttendanceEvent, {
      attendanceSessionId: savedSession.id,
      userId: user.id,
      eventType: 'CLOCK_IN',
      coordenada: `(${checkInDto.longitude},${checkInDto.latitude})`,
      photoMediaId: checkInDto.photoMediaId
    });

    await activeManager.save(event);

    return { message: 'Check-in exitoso', session: savedSession };
  }

  async checkOut(user: any, checkOutDto: CheckOutDto, manager?: EntityManager) {
    const activeManager = this.getManager(manager);
    const today = new Date().toISOString().split('T')[0];

    const session = await activeManager.findOne(AttendanceSession, {
      where: { userId: user.id, workDate: today }
    });

    if (!session) {
      throw new BadRequestException('No existe una sesión abierta para el día de hoy');
    }

    if (session.status === 'CLOSED') {
      throw new BadRequestException('La sesión de hoy ya fue cerrada');
    }

    session.status = 'CLOSED';
    session.endedAt = new Date();
    session.endLatitude = checkOutDto.latitude;
    session.endLongitude = checkOutDto.longitude;

    const savedSession = await activeManager.save(session);

    const event = activeManager.create(AttendanceEvent, {
      attendanceSessionId: savedSession.id,
      userId: user.id,
      eventType: 'CLOCK_OUT',
      coordenada: `(${checkOutDto.longitude},${checkOutDto.latitude})`,
      photoMediaId: checkOutDto.photoMediaId
    });

    await activeManager.save(event);

    return { message: 'Check-out exitoso', session: savedSession };
  }

  async getTodaySessions(manager?: EntityManager) {
    const activeManager = this.getManager(manager);
    const today = new Date().toISOString().split('T')[0];

    const sessions = await activeManager.find(AttendanceSession, {
      where: { workDate: today },
      relations: { user: true }
    });

    const sessionIds = sessions.map(s => s.id);
    const events = sessionIds.length > 0 
      ? await activeManager.find(AttendanceEvent, {
          where: { attendanceSessionId: In(sessionIds), eventType: 'CLOCK_IN' }
        })
      : [];

    const mediaIds = events.map(e => e.photoMediaId).filter(Boolean);
    const mediaAssets = mediaIds.length > 0
      ? await activeManager.find(MediaAsset, {
          where: { id: In(mediaIds) }
        })
      : [];

    const mediaMap = new Map(mediaAssets.map(m => [m.id, m.fileUrl]));
    const eventMap = new Map(events.map(e => [e.attendanceSessionId, mediaMap.get(e.photoMediaId)]));

    return sessions.map(session => {
      const photoUrl = eventMap.get(session.id) || null;
      return {
        id: session.id,
        userId: session.userId,
        name: session.user?.fullName || 'Usuario',
        status: session.status === 'OPEN' ? 'CHECKED_IN' : (session.status === 'CLOSED' ? 'INACTIVE' : session.status),
        time: session.startedAt ? new Date(session.startedAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Lima' }) : '-',
        startedAt: session.startedAt ? session.startedAt.toISOString() : null,
        alert: null,
        hasPhoto: !!photoUrl,
        photoUrl: photoUrl
      };
    });
  }

  async getMyHistory(user: any, manager?: EntityManager) {
    const activeManager = this.getManager(manager);
    const sessions = await activeManager.find(AttendanceSession, {
      where: { userId: user.id },
      order: { workDate: 'DESC' }
    });

    const sessionIds = sessions.map(s => s.id);
    const events = sessionIds.length > 0 
      ? await activeManager.find(AttendanceEvent, {
          where: { attendanceSessionId: In(sessionIds) },
          order: { createdAt: 'ASC' }
        })
      : [];

    return sessions.map(session => {
      const checkInEvent = events.find(e => e.attendanceSessionId === session.id && e.eventType === 'CLOCK_IN');
      const checkOutEvent = events.find(e => e.attendanceSessionId === session.id && e.eventType === 'CLOCK_OUT');

      const checkInTime = checkInEvent ? new Date(checkInEvent.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Lima' }) : '-';
      const checkOutTime = checkOutEvent ? new Date(checkOutEvent.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Lima' }) : '-';

      let totalHoursStr = '-';
      if (checkInEvent && checkOutEvent) {
        const diffMs = new Date(checkOutEvent.createdAt).getTime() - new Date(checkInEvent.createdAt).getTime();
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        totalHoursStr = `${diffHrs}h ${diffMins}m`;
      }

      return {
        id: session.id,
        workDate: session.workDate,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        totalHours: totalHoursStr,
        status: session.status === 'OPEN' ? 'CHECKED_IN' : (session.status === 'CLOSED' ? 'Completado' : session.status)
      };
    });
  }
}
