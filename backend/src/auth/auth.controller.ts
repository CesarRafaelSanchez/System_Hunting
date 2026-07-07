import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('refresh')
  async refresh(@Request() req: any) {
    return this.authService.refresh(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('impersonate')
  async impersonate(@Body('userId') userId: string, @Request() req: any) {
    return this.authService.impersonate(userId, req.user);
  }
}
