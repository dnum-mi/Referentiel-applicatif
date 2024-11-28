import { UserService } from './../user/user.service';
import { Controller, Post, Body, Request, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ExternalSourceService } from './external-source.service';
import { CreateExternalSourceDto } from './dto/create-external-source.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as jose from 'jose';


@ApiTags('external-sources')
@Controller('external-sources')
export class ExternalSourceController {
  constructor(
    private readonly externalSourceService: ExternalSourceService,
    private readonly userService: UserService,
  ) {}

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
      const decodedToken = this.getDecodedToken(req);
      const userFromDb = await this.findOrCreateUser(decodedToken);
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
    }
  }


  private getDecodedToken(req: any): any {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];

    try {
      return jose.decodeJwt(token);
    } catch (error) {
      Logger.error('Erreur lors du décodage du JWT :', error);
      throw new UnauthorizedException('JWT invalide ou malformé');
    }
  }


  private async findOrCreateUser(decodedToken: any) {
    try {
      const user = await this.userService.findOrCreateByEmail(
        <string>decodedToken.email,
        <string>decodedToken.sub,
      );

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      return user;
    } catch (error) {
      Logger.error('Erreur lors de la récupération/création de l\'utilisateur :', error);
      throw new UnauthorizedException('Échec lors de la gestion de l\'utilisateur');
    }
  }
}
