import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

  @Get('data')
  @ApiExcludeEndpoint()
  getSecureData() {
    return { message: 'This is secured data' };
  }
}
