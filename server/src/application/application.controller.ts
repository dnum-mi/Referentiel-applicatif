// src/application/application.controller.ts
import { Controller, Post, Body, Patch, Param, Request, Logger, Get, Query, HttpException, HttpStatus, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, CreateExternalReferenceDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchApplicationDto } from './dto/search-application.dto';
import { GetApplicationDto } from './dto/get-application.dto';

@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  applicationsService: any;
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle application' })
  @ApiResponse({ status: 201, description: 'Application créée avec succès.' })
  @ApiResponse({ status: 404, description: 'Metadata ou parent non trouvé.' })
  async create(
      @Body() createApplicationDto: CreateApplicationDto,
      @Body('externalReferences') reference: CreateExternalReferenceDto[],
      @Request() req
  ) {
      Logger.warn("Creating application...");
  
      // // Ajoutez cette vérification
      // if (!req.user || !req.user.keycloakId) {
      //     Logger.error('User ou keycloakId manquant dans la requête');
      //     throw new UnauthorizedException('Authentification de l’utilisateur requise');
      // }
  
      const ownerId = "f15d1c13-8198-4ca5-a180-94656e20d568";
      Logger.log({ ownerId });
  
      // Appel au service avec externalReferences inclus
      return this.applicationService.createApplication(createApplicationDto, ownerId, reference || []);
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
    @Body() updateApplicationDto: UpdateApplicationDto,
    @Request() req,
  ) {
    return this.applicationService.update(id, updateApplicationDto);
  }


}
