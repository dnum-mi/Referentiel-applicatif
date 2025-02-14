import { PrismaService } from './../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { HealthCheckRepository } from './health-check.repository.interface';

@Injectable()
export class PrismaHealthCheckRepository implements HealthCheckRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async checkDatabase(): Promise<void> {
    await this.prismaService.$queryRaw`SELECT 1`;
  }
}