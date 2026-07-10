import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private checkAdmin(req: any) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden realizar esta acción');
    }
  }

  @Get()
  async findAll(@Request() req: any) {
    this.checkAdmin(req);
    return this.usersService.findAll();
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateUserDto) {
    this.checkAdmin(req);
    return this.usersService.create(dto);
  }

  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    this.checkAdmin(req);
    return this.usersService.update(id, dto);
  }

  @Patch(':id/status')
  async toggleStatus(@Request() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.usersService.toggleStatus(id);
  }
}
