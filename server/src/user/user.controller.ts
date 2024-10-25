import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiExcludeEndpoint()
  async createOrUpdateUser(@Body() body): Promise<User> {
    console.log('Requête reçue');

    const { keycloakId, email } = body;
    console.log('keycloakId reçu :', keycloakId);
    console.log('Email reçu :', email);

    // Vérifiez si les informations nécessaires sont présentes
    if (!keycloakId || !email) {
      throw new BadRequestException('keycloakId et email sont requis.');
    }

    // Vérifiez si l'utilisateur existe déjà
    const existingUser = await this.userService.findUserByKeycloakId(keycloakId);

    if (existingUser) {
      return existingUser;
    }

    // Créez un nouvel utilisateur
    return this.userService.createUser(keycloakId, email);
  }
}
