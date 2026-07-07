import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TimeMarkModule } from './time-mark/time-mark.module';
import { PrediosModule } from './predios/predios.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { TechnicalRecordsModule } from './technical-records/technical-records.module';
import { IncidentsModule } from './incidents/incidents.module';
import { MediaModule } from './media/media.module';
import { ReportQueueModule } from './report-queue/report-queue.module';
import { BotApiModule } from './bot-api/bot-api.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'hunting_crm',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ¡Nunca usar synchronize en producción! Usar migraciones.l esquema
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    AuthModule,
    TimeMarkModule,
    PrediosModule,
    OpportunitiesModule,
    TechnicalRecordsModule,
    IncidentsModule,
    MediaModule,
    ReportQueueModule,
    BotApiModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
