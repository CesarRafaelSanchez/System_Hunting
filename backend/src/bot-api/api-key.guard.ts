import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] || request.query['api_key'];

    const validKey = process.env.BOT_API_KEY || 'FUTURA_BOT_SECRET_2026';

    if (apiKey === validKey) {
      return true;
    }

    throw new UnauthorizedException('API Key inválida o no proporcionada');
  }
}
