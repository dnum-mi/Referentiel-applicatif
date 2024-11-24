import { Controller, Post, Body, Patch, Param, Request, Logger, Get, Query, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { UserService } from '../user/user.service';
import { CreateApplicationDto, } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchApplicationDto } from './dto/search-application.dto';
import { GetApplicationDto } from './dto/get-application.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';

@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  applicationsService: ApplicationService;
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly userService: UserService
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle application' })
  @ApiResponse({ status: 201, description: 'Application créée avec succès.' })
  @ApiResponse({ status: 404, description: 'Metadata ou parent non trouvé.' })
  async create(
      @Body() createApplicationDto: CreateApplicationDto,
      @GetUser() user: any,
  ) {
    
      const ownerId = user.userId;
      Logger.log(`ownerId: ${ownerId}`);
      Logger.log(`userService: ${this.userService}`);

    // Récupérer l'utilisateur depuis la base de données
      const userFromDb = await this.userService.findUserByKeycloakId(ownerId);

    if (!userFromDb) {
        throw new UnauthorizedException('Utilisateur non trouvé');
    }

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
