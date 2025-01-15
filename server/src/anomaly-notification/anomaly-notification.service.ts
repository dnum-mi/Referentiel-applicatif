import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnomalyNotificationDto } from './dto/create-anomaly-notification.dto';
import { UpdateAnomalyNotificationDto } from './dto/update-anomaly-notification.dto';
import { GetAnomalyNotificationDto } from './dto/get-anomaly-notification.dto';
import { AuthUtils } from '../utils/helpers';
import { Logger } from '@nestjs/common';

@Injectable()
export class AnomalyNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  public async create(req: any, data: CreateAnomalyNotificationDto) {
    const decodedToken = AuthUtils.getDecodedToken(req);
    const notifierId = decodedToken.sub;
    const correctionDemand = this.prisma.anomalyNotification.create({
      data: {
        application: {
          connect: { id: data.applicationId },
        },
        notifier: {
          connect: { keycloakId: notifierId },
        },
        description: data.description,
        status: data.status,
      },
    });
    Logger.log(
      {
        message: 'Demannde de correction créée',
        data: data,
      },
      'create',
    );

    return correctionDemand;
  }

  /**
   * Récupère toutes les notifications d'anomalies.
   * @returns Un tableau de notifications d'anomalies.
   */
  async findAll() {
    Logger.log(
      {
        message: 'Récupération de toutes les notifications',
      },
      'findAll',
    );

    const notifications = await this.prisma.anomalyNotification.findMany({
      include: { history: true, application: true },
    });

    Logger.log(
      {
        message: 'Notifications récupérées',
        count: notifications.length,
      },
      'findAll',
    );

    return notifications;
  }

  /**
   * Récupère une notification d'anomalie par son ID.
   * @param id L'identifiant de la notification.
   * @returns La notification d'anomalie trouvée.
   * @throws NotFoundException Si la notification n'est pas trouvée.
   */
  async findOne(id: string) {
    const notification = await this.prisma.anomalyNotification.findUnique({
      where: { id },
      include: { history: true, application: true }, // Inclut les relations si nécessaire
    });
    if (!notification) {
      throw new NotFoundException(`Notification avec l'id ${id} non trouvée`);
    }
    return notification;
  }

  public async getAnomalyNotificationByNotifierId(
    notifierId: string,
  ): Promise<GetAnomalyNotificationDto[]> {
    const anomalyNotifications = await this.prisma.anomalyNotification.findMany(
      {
        where: { notifierId },
        include: { history: true, application: true },
      },
    );
    if (!anomalyNotifications || anomalyNotifications.length === 0) {
      Logger.error(
        {
          message: 'Aucune notification trouvée pour notifierId',
          notifierId: notifierId,
        },
        'getAnomalyNotificationByNotifierId',
      );
      throw new Error('Aucune notification de signalement trouvée');
    }
    const anomalyNotificationDtos = anomalyNotifications.map((anomaly) => ({
      id: anomaly.id,
      applicationId: anomaly.applicationId,
      application: {
        id: anomaly.application?.id,
        label: anomaly.application?.label,
      },
      notifierId: anomaly.notifierId,
      description: anomaly.description,
      status: anomaly.status,
      createdAt: anomaly.createdAt,
      updatedAt: anomaly.updatedAt || null,
    }));
    Logger.log({
      message: 'Récupération des notifications par notifierId',
      notifierId: notifierId,
    });
    return anomalyNotificationDtos;
  }

  /**
   * Met à jour une notification d'anomalie existante.
   * @param id L'identifiant de la notification.
   * @param data Les données de mise à jour.
   * @returns La notification d'anomalie mise à jour.
   * @throws NotFoundException Si la notification n'est pas trouvée.
   */
  async update(id: string, data: UpdateAnomalyNotificationDto) {
    await this.findOne(id);
    return this.prisma.anomalyNotification.update({
      where: { id },
      data,
    });
  }

  /**
   * Supprime une notification d'anomalie.
   * @param id L'identifiant de la notification.
   * @returns La notification d'anomalie supprimée.
   * @throws NotFoundException Si la notification n'est pas trouvée.
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.anomalyNotification.delete({
      where: { id },
    });
  }
}
