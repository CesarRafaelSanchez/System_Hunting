import { CallHandler, ExecutionContext, Injectable, NestInterceptor, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Observable, from, throwError } from 'rxjs';
import { catchError, concatMap, finalize } from 'rxjs/operators';

export const ENTITY_MANAGER_KEY = 'ENTITY_MANAGER';

@Injectable()
export class TransactionAuditInterceptor implements NestInterceptor {
  constructor(private dataSource: DataSource) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Solo interceptamos peticiones que muten estado
    if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH' && method !== 'DELETE') {
      return next.handle();
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Obtener el user_id inyectado por el guard (JWT AuthGuard)
    const userId = request.user?.id;

    try {
      if (userId) {
        // Ejecutamos SET LOCAL dentro de la transacción. Solo afectará al bloque actual.
        // Las comillas simples se escapan si es necesario, pero como userId es un UUID validado, es seguro.
        await queryRunner.query(`SET LOCAL crm.current_user_id = '${userId}';`);
      }

      // Adjuntamos el entityManager de esta transacción al request para que
      // los servicios lo utilicen en lugar de los repositorios globales.
      request[ENTITY_MANAGER_KEY] = queryRunner.manager;

      return next.handle().pipe(
        concatMap(async (data) => {
          await queryRunner.commitTransaction();
          return data;
        }),
        catchError((err) => {
          return from(queryRunner.rollbackTransaction()).pipe(
            concatMap(() => throwError(() => err))
          );
        }),
        finalize(async () => {
          await queryRunner.release();
        })
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw new InternalServerErrorException('Error inicializando transacción');
    }
  }
}
