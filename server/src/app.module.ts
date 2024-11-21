

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { AuthModule } from './auth/auth.module';
import { ApplicationModule } from './application/application.module';
import { UserModule } from './user/user.module';
import { ApplicationController } from './application/application.controller';
import { UserController } from './user/user.controller';
import { ApplicationService } from './application/application.service';
import { UserService } from './user/user.service';
import { ExternalSourceModule } from './external-source/external-source.module';
import { JwtStrategy } from './auth/jwt.strategy';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ApplicationModule,
    ExternalSourceModule,
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
      realm: process.env.KEYCLOAK_REALM,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      secret: process.env.KEYCLOAK_CLIENT_SECRET,
      // Secret key of the client taken from keycloak server
    }),
  ],
  controllers: [AppController, ApplicationController, UserController],
  providers: [
    AppService,
    ApplicationService,
    UserService,
    JwtStrategy,
  ],
})
export class AppModule {}