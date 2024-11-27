import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Request,
  Logger,
  Get,
  Query,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { UserService } from '../user/user.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchApplicationDto } from './dto/search-application.dto';
import { GetApplicationDto } from './dto/get-application.dto';
import * as jose from 'jose';

@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  applicationsService: ApplicationService;

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle application' })
  @ApiResponse({ status: 201, description: 'Application créée avec succès.' })
  @ApiResponse({ status: 404, description: 'Metadata ou parent non trouvé.' })
  public async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Request() req,
  ) {
    Logger.log('create method called');

    const decodedToken = this.getDecodedToken(req);
    const userFromDb = await this.findOrCreateUser(decodedToken);

    const newApplication = await this.applicationService.createApplication(
      userFromDb.keycloakId,
      createApplicationDto,
    );

    return {
      status: 201,
      message: 'Application créée avec succès',
      data: newApplication,
    };
  }

  @Get('search')
  async searchApplications(@Query() searchParams: SearchApplicationDto) {
    console.log(searchParams);
    return this.applicationService.searchApplications(searchParams);
  }

  @Get(':id')
  async getApplicationById(@Param('id') id: string): Promise<GetApplicationDto> {
    try {
      const application = await this.applicationService.getApplicationById(id);
      return application;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une application existante' })
  @ApiResponse({ status: 200, description: 'Application mise à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Application, metadata ou parent non trouvé.' })
  async update(
    @Param('id') id: string,
    @Body() applicationToUpdate: UpdateApplicationDto,
    @Request() req,
  ) {
    return this.applicationService.updateApplication(id, applicationToUpdate);
  }


  private getDecodedToken(req: any): any {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('En-tête Authorization manquant');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token Bearer non fourni');
    }

    try {
      return jose.decodeJwt(token);
    } catch (error) {
      Logger.error('Erreur lors du décodage du JWT :', error);
      throw new UnauthorizedException('JWT invalide ou malformé');
    }
  }


  private async findOrCreateUser(decodedToken: any) {
    if (!decodedToken.email || !decodedToken.sub) {
      throw new UnauthorizedException('JWT manquant de claims requis (email ou sub)');
    }

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