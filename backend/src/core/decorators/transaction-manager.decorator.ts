import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ENTITY_MANAGER_KEY } from '../interceptors/transaction-audit.interceptor';
import { EntityManager } from 'typeorm';

export const TransactionManager = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): EntityManager => {
    const request = ctx.switchToHttp().getRequest();
    return request[ENTITY_MANAGER_KEY];
  },
);
