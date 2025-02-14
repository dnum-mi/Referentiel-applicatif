import { PrismaService } from './../prisma/prisma.service';
import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';
import { HealthCheckService } from './health-check.service';
import { HEALTH_CHECK_REPOSITORY } from './infrastructure/repository/health-check.repository.interface';
import { PrismaHealthCheckRepository } from './infrastructure/repository/health-check.repository';

@Module({
  controllers: [HealthCheckController],
  providers: [
    HealthCheckService,
    {
      provide: HEALTH_CHECK_REPOSITORY,
      useClass: PrismaHealthCheckRepository,
    },
    PrismaService,
  ],
})
export class HealthCheckModule {}