// src/application/application.module.ts
import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ApplicationController } from './application.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService],
})
export class ApplicationModule {}
