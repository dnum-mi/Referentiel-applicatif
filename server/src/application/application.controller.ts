import { UserService } from './../user/user.service';
import { AuthUtils } from '../utils/helpers';
import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Request,
  Get,
  Query,
  NotFoundException,
  Logger,
  BadRequestException,
  Response,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchApplicationDto } from './dto/search-application.dto';
import { GetApplicationDto } from './dto/get-application.dto';
import { ExportService } from './export.service';

@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  applicationsService: ApplicationService;

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly userService: UserService,
    private readonly exportService: ExportService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle application' })
  @ApiResponse({ status: 201, description: 'Application créée avec succès.' })
  @ApiResponse({ status: 404, description: 'Metadata ou parent non trouvé.' })
  public async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Request() req,
  ) {
    const decodedToken = AuthUtils.getDecodedToken(req);
    const userFromDb = await AuthUtils.findOrCreateUser(
      decodedToken,
      this.userService,
    );

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
  async searchApplications(@Query() query: SearchApplicationDto) {
    return await this.applicationService.searchApplications(query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Exporter les applications' })
  @ApiResponse({ status: 200, description: 'Export réalisé avec succès.' })
  @ApiResponse({ status: 400, description: 'Erreur lors de l\'exportation.' })
  async exportApplications(@Query() query: SearchApplicationDto, 
  @Response() res) {
    try {
      const applications = await this.applicationService.searchApplications(query);

      const headers = ['id', 'label', 'description', 'createdBy', 'createdAt'];
      const data = applications.map((app) => ({
        id: app.id,
        label: app.label,
        description: app.description || '',
        createdBy: app.metadata?.createdById || '',
        createdAt: app.metadata?.createdAt?.toISOString() || '',
      }));

      const csvContent = this.exportService.generateCsv(data, headers);

      // Envoyer le fichier CSV dans la réponse
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"');
      res.status(200).send(csvContent);
    } catch (error) {
      Logger.error('Erreur lors de l\'exportation des applications', error);
      throw new BadRequestException('Erreur lors de l\'exportation.');
    }
  }

  @Get(':id')
  async getApplicationById(
    @Param('id') id: string,
  ): Promise<GetApplicationDto> {
    try {
      const application = await this.applicationService.getApplicationById(id);
      Logger.log(application)
      return application;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une application existante' })
  @ApiResponse({
    status: 200,
    description: 'Application mise à jour avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'Application, metadata ou parent non trouvé.',
  })
  async update(
    @Param('id') id: string,
    @Body() applicationToUpdate: UpdateApplicationDto,
    @Request() req,
  ) {
    return this.applicationService.updateApplication(id, applicationToUpdate);
  }
}
