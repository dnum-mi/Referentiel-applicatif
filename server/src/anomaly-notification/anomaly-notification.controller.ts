import { UserService } from './../user/user.service';
import { AuthUtils } from '../utils/helpers';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnomalyNotificationService } from './anomaly-notification.service';
import {
  CreateAnomalyNotificationDto,
  CreateAnomalyNotificationRequestDto,
} from './dto/create-anomaly-notification.dto';
import { GetAnomalyNotificationDto } from './dto/get-anomaly-notification.dto';
import { UpdateAnomalyNotificationDto } from './dto/update-anomaly-notification.dto';

@Controller('anomaly-notifications')
export class AnomalyNotificationController {
  constructor(
    private readonly anomalyNotificationService: AnomalyNotificationService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(
    @Request() req,
    @Body() requestData: CreateAnomalyNotificationRequestDto, // Utilisation du DTO de requête
  ) {
    Logger.log(
      'Réception d’une demande de modification de la fiche application.',
    );

    const decodedToken = AuthUtils.getDecodedToken(req);
    if (typeof decodedToken.sub !== 'string') {
      throw new Error(
        'Le token ne contient pas un identifiant utilisateur valide.',
      );
    }
    const currentNotifierId = decodedToken.sub;
    Logger.log('NotifierId extrait du token:', currentNotifierId);

    const data: CreateAnomalyNotificationDto = {
      ...requestData,
      notifierId: currentNotifierId,
    };

    return this.anomalyNotificationService.create(req, data);
  }

  @Get()
  findAll() {
    return this.anomalyNotificationService.findAll();
  }

  @ApiOperation({
    summary:
      "Récupérer les notifications de signalements pour l'utilisateur actuellement connecté",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des notifications de signalements retournée.',
  })
  @ApiResponse({ status: 404, description: 'Aucune notification trouvée.' })
  @Get('user-notifications')
  async getAnomalyNotificationsByUser(
    @Request() req,
  ): Promise<GetAnomalyNotificationDto[]> {
    try {
      const decodedToken = AuthUtils.getDecodedToken(req);
      const userFromDb = await AuthUtils.findOrCreateUser(
        decodedToken,
        this.userService,
      );
      const anomalyNotifications =
        await this.anomalyNotificationService.getAnomalyNotificationByNotifierId(
          userFromDb.keycloakId,
        );
      return anomalyNotifications;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.anomalyNotificationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAnomalyNotificationDto,
  ) {
    return this.anomalyNotificationService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.anomalyNotificationService.remove(id);
  }
}
