import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { ApplicationModule } from './application/application.module';
import { UserModule } from './user/user.module';
import { ApplicationController } from './application/application.controller';
import { UserController } from './user/user.controller';
import { ApplicationService } from './application/application.service';
import { UserService } from './user/user.service';
import { ExternalSourceModule } from './external-source/external-source.module';
import { ConfigModule } from '@nestjs/config';
import { ExternalModule } from './external/external.module';
import { ExportService } from './application/export.service';
import { AnomalyNotificationModule } from './anomaly-notification/anomaly-notification.module';
import { AnomalyNotificationController } from './anomaly-notification/anomaly-notification.controller';
import { AnomalyNotificationService } from './anomaly-notification/anomaly-notification.service';
import { LoggerModule } from './logger/logger.module';
import { CombinedInterceptor } from './logger/combined.interceptor';
import { AuthMiddleware } from './middlewares/auth.middleware';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ApplicationModule,
    ExternalSourceModule,
    ExternalModule,
    AnomalyNotificationModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    ApplicationController,
    AnomalyNotificationController,
    UserController,
  ],
  providers: [
    AppService,
    ApplicationService,
    AnomalyNotificationService,
    ExportService,
    UserService,
    CombinedInterceptor,
    AuthMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
