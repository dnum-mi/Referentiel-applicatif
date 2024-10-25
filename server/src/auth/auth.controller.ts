import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {

  @UseGuards(JwtAuthGuard)
  @Get('data')
  getSecureData() {
    return { message: 'This is secured data' };
  }
}
