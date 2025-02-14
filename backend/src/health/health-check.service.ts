import { HEALTH_CHECK_REPOSITORY, HealthCheckRepository } from './infrastructure/repository/health-check.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class HealthCheckService {
  constructor(
    @Inject(HEALTH_CHECK_REPOSITORY)
    private readonly healthCheckRepository: HealthCheckRepository,
  ) {}

  async execute(): Promise<{ status: string }> {
    try {
      await this.healthCheckRepository.checkDatabase();
      return { status: 'ok' };
    } catch (error) {
      throw error; 
    }
  }
}