import { Controller, Post, Get, Body, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { TimeMarkService } from './time-mark.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AuthGuard } from '@nestjs/passport';
import { TransactionAuditInterceptor } from '../core/interceptors/transaction-audit.interceptor';
import { TransactionManager } from '../core/decorators/transaction-manager.decorator';
import { EntityManager } from 'typeorm';

@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TransactionAuditInterceptor)
@Controller('attendance')
export class TimeMarkController {
  constructor(private readonly timeMarkService: TimeMarkService) {}

  @Post('check-in')
  async checkIn(
    @Request() req: any,
    @Body() checkInDto: CheckInDto,
    @TransactionManager() manager: EntityManager
  ) {
    return this.timeMarkService.checkIn(req.user, checkInDto, manager);
  }

  @Post('check-out')
  async checkOut(
    @Request() req: any,
    @Body() checkOutDto: CheckOutDto,
    @TransactionManager() manager: EntityManager
  ) {
    return this.timeMarkService.checkOut(req.user, checkOutDto, manager);
  }

  @Get('today')
  async getTodayAttendance(
    @TransactionManager() manager: EntityManager
  ) {
    return this.timeMarkService.getTodaySessions(manager);
  }
}
