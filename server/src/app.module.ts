

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './auth/auth.module';
import { ApplicationModule } from './application/application.module';
import { UserModule } from './user/user.module';
import { ApplicationController } from './application/application.controller';
import { UserController } from './user/user.controller';
import { ApplicationService } from './application/application.service';
import { UserService } from './user/user.service';
import { ExternalSourceModule } from './external-source/external-source.module';
import { ConfigModule } from '@nestjs/config';
import { ExternalModule } from './external/external.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ApplicationModule,
    ExternalSourceModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ExternalModule,
  ],
  controllers: [AppController, ApplicationController, UserController],
  providers: [
    AppService,
    ApplicationService,
    UserService,
  ],
})
export class AppModule {}