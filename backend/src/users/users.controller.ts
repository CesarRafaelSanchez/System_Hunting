import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private checkAdmin(req: any) {
    const isAgencyAdmin = req.user?.globalRole === 'AGENCY_ADMIN' || req.user?.role === 'AGENCY_ADMIN';
    const isLocalAdmin = req.user?.role === 'ACCOUNT_ADMIN' || req.user?.role === 'ADMIN';
    if (!isAgencyAdmin && !isLocalAdmin) {
      throw new ForbiddenException('Solo los administradores pueden realizar esta acción');
    }
  }

  @Get()
  async findAll(@Request() req: any) {
    this.checkAdmin(req);
    return this.usersService.findAll(req.user);
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateUserDto) {
    this.checkAdmin(req);
    return this.usersService.create(dto, req.user);
  }

  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    this.checkAdmin(req);
    return this.usersService.update(id, dto, req.user);
  }

  @Patch(':id/status')
  async toggleStatus(@Request() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.usersService.toggleStatus(id, req.user);
  }
}
