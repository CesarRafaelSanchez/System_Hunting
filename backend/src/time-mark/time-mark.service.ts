import { Injectable, BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AttendanceSession } from '../database/entities/attendance-session.entity';
import { AttendanceEvent } from '../database/entities/attendance-event.entity';

@Injectable()
export class TimeMarkService {
  
  async checkIn(user: any, checkInDto: CheckInDto, manager: EntityManager) {
    const today = new Date().toISOString().split('T')[0];

    // Verificar si ya existe una sesión abierta o completada hoy
    const existingSession = await manager.findOne(AttendanceSession, {
      where: { userId: user.id, workDate: today }
    });

    if (existingSession) {
      throw new BadRequestException('Ya existe una sesión de asistencia registrada para hoy');
    }

    // Crear la sesión
    const session = manager.create(AttendanceSession, {
      companyId: user.companyId,
      userId: user.id,
      workDate: today,
      status: 'OPEN',
      startedAt: new Date(),
      startLatitude: checkInDto.latitude,
      startLongitude: checkInDto.longitude,
    });

    const savedSession = await manager.save(session);

    // Crear el evento de Clock In
    const event = manager.create(AttendanceEvent, {
      attendanceSessionId: savedSession.id,
      userId: user.id,
      eventType: 'CLOCK_IN',
      coordenada: `(${checkInDto.longitude},${checkInDto.latitude})`,
      photoMediaId: checkInDto.photoMediaId
    });

    await manager.save(event);

    return { message: 'Check-in exitoso', session: savedSession };
  }

  async checkOut(user: any, checkOutDto: CheckOutDto, manager: EntityManager) {
    const today = new Date().toISOString().split('T')[0];

    const session = await manager.findOne(AttendanceSession, {
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

    const savedSession = await manager.save(session);

    const event = manager.create(AttendanceEvent, {
      attendanceSessionId: savedSession.id,
      userId: user.id,
      eventType: 'CLOCK_OUT',
      coordenada: `(${checkOutDto.longitude},${checkOutDto.latitude})`,
      photoMediaId: checkOutDto.photoMediaId
    });

    await manager.save(event);

    return { message: 'Check-out exitoso', session: savedSession };
  }

  async getTodaySessions(manager: EntityManager) {
    const today = new Date().toISOString().split('T')[0];

    const sessions = await manager.find(AttendanceSession, {
      where: { workDate: today },
      relations: { user: true }
    });

    return sessions.map(session => ({
      id: session.id,
      name: session.user?.fullName || 'Usuario',
      status: session.status === 'OPEN' ? 'CHECKED_IN' : (session.status === 'CLOSED' ? 'INACTIVE' : session.status),
      time: session.startedAt ? new Date(session.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
      alert: null,
      hasPhoto: true,
      photoUrl: null
    }));
  }
}
