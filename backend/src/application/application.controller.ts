import { UserService } from '../user/user.service';
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
  BadRequestException,
  Response,
  Logger,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import {
  CreateApplicationDto,
  PatchApplicationDto,
} from './dto/create-application.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { SearchApplicationDto } from './dto/search-application.dto';
import { GetApplicationDto } from './dto/get-application.dto';
import { ExportService } from './export.service';

/**
 * Controller pour la gestion des applications.
 * Permet de créer, rechercher, mettre à jour, récupérer et exporter des applications.
 */
@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  applicationsService: ApplicationService;

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly userService: UserService,
    private readonly exportService: ExportService,
  ) {}

  /**
   * Crée une nouvelle application.
   * Cette méthode permet de créer une application en utilisant les données fournies.
   * 
   * @param createApplicationDto Les données nécessaires pour créer une nouvelle application.
   * @param req La requête contenant le token de l'utilisateur authentifié.
   * 
   * @returns La nouvelle application créée.
   * @throws BadRequestException Si le token est invalide ou l'identifiant utilisateur est manquant.
   * 

   */
  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle application' })
  @ApiResponse({ status: 201, description: 'Application créée avec succès.' })
  @ApiResponse({ status: 404, description: 'Metadata ou parent non trouvé.' })
  public async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Request() req,
  ) {
    const user = req.user;

    Logger.log({
      message: "Début de la création de l'application",
      userId: user.keycloakId,
      action: 'create',
    });

    const newApplication = await this.applicationService.createApplication(
      user.id,
      createApplicationDto,
    );
    return newApplication;
  }

  /**
   * Recherche des applications en fonction des critères fournis.
   *
   * @param searchParams Paramètres de recherche des applications.
   *
   * @returns La liste des applications qui correspondent aux critères.
   * @throws NotFoundException Si aucune application n'est trouvée.
   */
  @Get('search')
  @ApiOperation({ summary: 'Rechercher des applications' })
  @ApiResponse({
    status: 200,
    description:
      'Liste des applications correspondant aux critères de recherche.',
  })
  async searchApplications(@Query() searchParams: SearchApplicationDto) {
    const applications =
      await this.applicationService.searchApplications(searchParams);

    return applications;
  }

  /**
   * Exporte les applications sous format CSV.
   *
   * @param query Les critères de recherche pour filtrer les applications à exporter.
   * @param res La réponse HTTP utilisée pour envoyer le fichier CSV.
   *
   * @throws BadRequestException Si une erreur se produit lors de l'exportation.
   *
   * @operation { GET } /applications/export
   */
  @Get('export')
  @ApiOperation({ summary: 'Exporter les applications' })
  @ApiResponse({ status: 200, description: 'Export réalisé avec succès.' })
  @ApiResponse({ status: 400, description: "Erreur lors de l'exportation." })
  @ApiExcludeEndpoint()
  async exportApplications(
    @Query() query: SearchApplicationDto,
    @Response() res,
  ) {
    try {
      const applications =
        await this.applicationService.searchApplications(query);

      const headers = ['id', 'label', 'description', 'createdBy', 'createdAt'];
      const data = applications.map((app) => ({
        id: app.id,
        label: app.label,
        description: app.description || '',
        createdBy: app.metadata?.createdById || '',
        createdAt: app.metadata?.createdAt?.toISOString() || '',
      }));

      const csvContent = this.exportService.generateCsv(data, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="applications.csv"',
      );
      res.status(200).send(csvContent);
    } catch (error) {
      throw new BadRequestException("Erreur lors de l'exportation.");
    }
  }

  /**
   * Récupère une application spécifique par son ID.
   *
   * @param id L'identifiant de l'application à récupérer.
   *
   * @returns L'application correspondant à l'ID spécifié.
   * @throws NotFoundException Si l'application n'est pas trouvée.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une application spécifique par ID' })
  async findOne(@Param('id') id: string): Promise<GetApplicationDto> {
    try {
      const application = await this.applicationService.getApplicationById(id);

      return application;
    } catch (error) {
      throw new NotFoundException('Application non trouvée');
    }
  }

  /**
   * Récupère toutes les applications.
   *
   * @returns La liste de toutes les applications.
   *
   * @operation { GET } /applications
   * @ApiOperation({ summary: 'Récupérer les applications' })
   * @ApiResponse({ status: 200, description: 'Liste des applications' })
   */
  @Get()
  @ApiOperation({ summary: 'Récupérer les applications' })
  @ApiResponse({ status: 200, description: 'Liste des applications' })
  async findAll() {
    return await this.applicationService.getApplications();
  }

  /**
   * Met à jour les informations d'une application.
   *
   * @param id L'identifiant de l'application à mettre à jour.
   * @param applicationToUpdate Les nouvelles données de l'application à mettre à jour.
   *
   * @returns L'application mise à jour.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une applications' })
  async update(
    @Param('id') id: string,
    @Body() applicationToUpdate: PatchApplicationDto,
  ): Promise<PatchApplicationDto> {
    return this.applicationService.update({
      where: { id: id },
      data: applicationToUpdate,
    });
  }
}
