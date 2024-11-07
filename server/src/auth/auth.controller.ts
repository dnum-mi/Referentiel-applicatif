import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

  @UseGuards(JwtAuthGuard)
  @Get('data')
  @ApiExcludeEndpoint()
  getSecureData() {
    return { message: 'This is secured data' };
  }
}
