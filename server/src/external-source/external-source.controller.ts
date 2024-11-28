import { Controller, Post, Body, Request, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ExternalSourceService } from './external-source.service';
import { CreateExternalSourceDto } from './dto/create-external-source.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthUtils } from '../utils/auth.utils';

@ApiTags('external-sources')
@Controller('external-sources')
export class ExternalSourceController {
  private authUtils: AuthUtils;
  constructor(private readonly externalSourceService: ExternalSourceService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle source externe' })
  @ApiResponse({ status: 201, description: 'Source externe créée avec succès.' })
  @ApiResponse({ status: 404, description: 'Utilisateur ou autres ressources non trouvées.' })
  public async createExternalSource(
    @Body() createExternalSourceDto: CreateExternalSourceDto,
    @Request() req,
  ) {
    Logger.log('createExternalSource method called');
  
    try {
      const decodedToken = this.authUtils.getDecodedToken(req);
      const userFromDb = await this.authUtils.findOrCreateUser(decodedToken);
      const newExternalSource = await this.externalSourceService.createExternalSource(
        createExternalSourceDto,
        userFromDb.keycloakId,
      );
  
      return {
        status: 201,
        message: 'Source externe créée avec succès',
        data: newExternalSource,
      };
    } catch (error) {
      Logger.error('Erreur lors de la création de la source externe', error);
  
      throw new InternalServerErrorException(
        'Erreur interne lors de la création de la source externe.',
      );
    }
  }
}
