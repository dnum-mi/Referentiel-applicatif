import { Controller, Post, Body, Patch, Param, Request, Logger, Get, Query, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { UserService } from '../user/user.service';
import { CreateApplicationDto, } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchApplicationDto } from './dto/search-application.dto';
import { GetApplicationDto } from './dto/get-application.dto';
import * as jose from 'jose'

@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  applicationsService: ApplicationService;
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly userService: UserService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle application' })
  @ApiResponse({ status: 201, description: 'Application créée avec succès.' })
  @ApiResponse({ status: 404, description: 'Metadata ou parent non trouvé.' })
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Request() req
  ) {
    Logger.log('create method called');

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('En-tête Authorization manquant');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token Bearer non fourni');
    }

    let decodedToken;
    try {
      decodedToken = jose.decodeJwt(token);
    } catch (error) {
      Logger.error('Erreur lors du décodage du JWT :', error);
      throw new UnauthorizedException('JWT invalide ou malformé');
    }


    if (!decodedToken.email || !decodedToken.sub) {
      throw new UnauthorizedException('JWT manquant de claims requis (email ou sub)');
    }

    try {
      const userFromDb = await this.userService.findOrCreateByEmail(
        <string>decodedToken.email,
        <string>decodedToken.sub
      );

      if (!userFromDb) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      const newApplication = await this.applicationService.createApplication(
        userFromDb.keycloakId,
        createApplicationDto
      );

      return {
        status: 201,
        message: 'Application créée avec succès',
        data: newApplication,
      };
    } catch (error) {
      Logger.error('Erreur lors de la création de l\'application :', error);
      throw new UnauthorizedException('Échec de la création de l\'application');
    }
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


}
