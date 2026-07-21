import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TenantGuard } from '../auth/guards/tenant.guard';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private checkAdmin(req: any) {
    if (req.user?.role !== 'ACCOUNT_ADMIN' && req.user?.role !== 'AGENCY_ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden realizar esta acción');
    }
  }

  @UseGuards(TenantGuard)
  @Get()
  async findAll(@Request() req: any) {
    this.checkAdmin(req);
    // Ahora el servicio debe filtrar por companyId internamente
    return this.usersService.findAll(req.user?.companyId);
  }

  // Este endpoint NO lleva TenantGuard porque se usa antes de elegir tenant
  @Get('me/workspaces')
  async getWorkspaces(@Request() req: any) {
    return this.usersService.getUserWorkspaces(req.user);
  }

  @UseGuards(TenantGuard)
  @Post()
  async create(@Request() req: any, @Body() dto: CreateUserDto) {
    this.checkAdmin(req);
    // Forzamos el companyId del DTO a ser el del tenant actual
    if (req.user?.role !== 'AGENCY_ADMIN') {
       dto.companyId = req.user.companyId;
    }
    return this.usersService.create(dto);
  }

  @UseGuards(TenantGuard)
  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    this.checkAdmin(req);
    if (req.user?.role !== 'AGENCY_ADMIN') {
       dto.companyId = req.user.companyId;
    }
    return this.usersService.update(id, dto);
  }

  @UseGuards(TenantGuard)
  @Patch(':id/status')
  async toggleStatus(@Request() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.usersService.toggleStatus(id);
  }
}
