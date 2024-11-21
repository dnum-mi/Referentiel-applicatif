import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from './authentication.guard';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

  @UseGuards(AuthenticationGuard)
  @Get('data')
  @ApiExcludeEndpoint()
  getSecureData() {
    return { message: 'This is secured data' };
  }
}
