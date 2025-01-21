import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('by-keycloak-id/:keycloakId')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Find user by keycloakId' })
  @ApiParam({
    name: 'keycloakId',
    required: true,
    description: 'The Keycloak user identifier',
    type: String,
  })
  async findUserByKeycloakId(@Param('keycloakId') keycloakId: string) {
    if (!keycloakId) {
      throw new BadRequestException('keycloakId is required');
    }
    const user = await this.userService.findUserByKeycloakId(keycloakId);
    return user;
  }
}
