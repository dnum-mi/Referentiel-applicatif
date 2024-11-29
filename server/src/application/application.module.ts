// src/application/application.module.ts
import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ApplicationController } from './application.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from 'src/user/user.module';
import { AuthUtils } from 'src/utils/helpers';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService, AuthUtils],
})
export class ApplicationModule {}
