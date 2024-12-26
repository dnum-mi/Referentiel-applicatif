import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AnomalyNotificationService } from './anomaly-notification.service';
import { CreateAnomalyNotificationDto } from './dto/create-anomaly-notification.dto';
import { UpdateAnomalyNotificationDto } from './dto/update-anomaly-notification.dto';

@Controller('anomaly-notifications')
export class AnomalyNotificationController {
  constructor(
    private readonly anomalyNotificationService: AnomalyNotificationService,
  ) {}

  /**
   * Crée une nouvelle notification d'anomalie.
   * @param data Les données de création de la notification.
   * @returns La notification créée.
   */
  @Post()
  create(@Body() data: CreateAnomalyNotificationDto) {
    return this.anomalyNotificationService.create(data);
  }

  /**
   * Récupère toutes les notifications d'anomalies.
   * @returns Un tableau de notifications.
   */
  @Get()
  findAll() {
    return this.anomalyNotificationService.findAll();
  }

  /**
   * Récupère une notification d'anomalie par son ID.
   * @param id L'identifiant de la notification.
   * @returns La notification trouvée.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.anomalyNotificationService.findOne(id);
  }

  /**
   * Met à jour une notification d'anomalie existante.
   * @param id L'identifiant de la notification.
   * @param updateDto Les nouvelles données pour la notification.
   * @returns La notification mise à jour.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAnomalyNotificationDto,
  ) {
    return this.anomalyNotificationService.update(id, updateDto);
  }

  /**
   * Supprime une notification d'anomalie.
   * @param id L'identifiant de la notification.
   * @returns La notification supprimée.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.anomalyNotificationService.remove(id);
  }
}
