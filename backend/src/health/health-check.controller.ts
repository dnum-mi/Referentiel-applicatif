import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheckService } from './health-check.service';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  @ApiOperation({ summary: "Vérification de la santé de l'application" })
  @ApiResponse({ status: 200, description: "L'application fonctionne correctement." })
  @ApiResponse({ status: 503, description: 'Service indisponible.' })
  async checkHealth() {
    try {
      const result = await this.healthCheckService.execute();
      return result;
    } catch (error) {
      throw new HttpException(
        { status: 'error', message: error },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}