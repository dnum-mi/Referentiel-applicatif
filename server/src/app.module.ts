

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';import { AuthModule } from './auth/auth.module';
import { ApplicationModule } from './application/application.module';
import { UserModule } from './user/user.module';
import { ApplicationController } from './application/application.controller';
import { UserController } from './user/user.controller';
import { ApplicationService } from './application/application.service';
import { UserService } from './user/user.service';
import { ExternalSourceModule } from './external-source/external-source.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ApplicationModule,
    ExternalSourceModule,
    // KeycloakConnectModule.register({
    //   authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
    //   realm: process.env.KEYCLOAK_REALM,
    //   clientId: process.env.KEYCLOAK_CLIENT_ID,
    //   secret: process.env.KEYCLOAK_CLIENT_SECRET,
    //   // Secret key of the client taken from keycloak server
    // }),
  ],
  controllers: [AppController, ApplicationController, UserController],
  providers: [
    AppService,
    ApplicationService,
    UserService,
  ],
})
export class AppModule {}