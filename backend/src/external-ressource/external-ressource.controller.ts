import { UserService } from '../user/user.service';
import {
  Controller,
  Post,
  Body,
  Request,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ExternalRessourceService } from './external-ressource.service';
import { CreateExternalRessourceDto } from './dto/create-external-ressource.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthUtils } from '../utils/helpers';

@ApiTags('external-Ressources')
@Controller('external-Ressources')
export class ExternalRessourceController {
  constructor(
    private readonly externalRessourceService: ExternalRessourceService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle Ressource externe' })
  @ApiResponse({
    status: 201,
    description: 'Ressource externe créée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur ou autres ressources non trouvées.',
  })
  public async createExternalRessource(
    @Body() createExternalRessourceDto: CreateExternalRessourceDto,
    @Request() req,
  ) {
    Logger.log('createExternalRessource method called');

    try {
      const decodedToken = AuthUtils.getDecodedToken(req);
      const userFromDb = await AuthUtils.findOrCreateUser(
        decodedToken,
        this.userService,
      );
      const newExternalRessource =
        await this.externalRessourceService.createExternalRessource(
          createExternalRessourceDto,
          userFromDb.keycloakId,
        );

      return {
        status: 201,
        message: 'Ressource externe créée avec succès',
        data: newExternalRessource,
      };
    } catch (error) {
      Logger.error('Erreur lors de la création de la Ressource externe', error);
    }
  }
}
