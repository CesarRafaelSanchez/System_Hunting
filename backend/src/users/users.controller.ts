import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Request() req: any) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Forbidden');
    }
    return this.usersService.findAll();
  }
}
