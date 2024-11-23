// src/application/application.controller.ts
import { Controller, Post, Body, Patch, Param, Request, Logger, Get, Query, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchApplicationDto } from './dto/search-application.dto';
import { GetApplicationDto } from './dto/get-application.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from 'src/auth/jwt-payloard.interface';
import { GetUser } from 'src/auth/get-user.decorator';

@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  applicationsService: ApplicationService;
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle application' })
  @ApiResponse({ status: 201, description: 'Application créée avec succès.' })
  @ApiResponse({ status: 404, description: 'Metadata ou parent non trouvé.' })
  async create(
      @Body() createApplicationDto: CreateApplicationDto,
      @GetUser() user: JwtPayload
  ) {
      Logger.warn("Creating application...", user);
      const ownerId = "f15d1c13-8198-4ca5-a180-94656e20d568";
      Logger.warn("ownerId", ownerId)

      if (!ownerId) {
          throw new UnauthorizedException('Authentification de l’utilisateur requise');
      }

      const newApplication = await this.applicationService.createApplication(ownerId, createApplicationDto);
      return { status: 201, message: "Application créée avec succès", data: newApplication };
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
