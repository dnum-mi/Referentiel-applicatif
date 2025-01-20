import { AnomalyNotification } from './../../node_modules/.pnpm/@prisma+client@6.2.1_prisma@6.2.1/node_modules/.prisma/client/index.d';
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
  /**
   * Crée une nouvelle notification d'anomalie.
   * @param req La requête HTTP de l'utilisateur.
   * @param data Les données nécessaires pour créer la notification.
   * @returns La notification d'anomalie créée.
   */
  public async create(data: CreateAnomalyNotificationDto) {
    const anomalyNotification = await this.prisma.anomalyNotification.create({
      data: {
        application: {
          connect: { id: data.applicationId },
        },
        notifier: {
          connect: { id: data.notifierId },
        },
        description: data.description,
        status: data.status,
      },
    });
    Logger.log({
      message: "Création de la notification d'anomalie.",
      data: {
        applicationId: data.applicationId,
        notifierId: data.notifierId,
        description: data.description,
        status: data.status,
      },
      action: 'create',
    });
    return anomalyNotification;
  }

  /**
   * Récupère toutes les notifications d'anomalies.
   * @returns Un tableau de notifications d'anomalies.
   */
  async findAll() {
    const notifications = await this.prisma.anomalyNotification.findMany({
      include: { history: true, application: true },
    });
    Logger.log({
      message: 'Notifications récupérées avec succès.',
      count: notifications.length,
      action: 'findAll',
    });
    return notifications;
  }

  /**
   * Récupère une notification d'anomalie par son ID.
   * @param id L'identifiant de la notification.
   * @returns La notification d'anomalie trouvée.
   * @throws NotFoundException Si la notification n'est pas trouvée.
   */
  async findOne(id: string) {
    Logger.log({
      message: `Récupération de la notification avec l'ID: ${id}`,
      action: 'findOne',
    });
    const notification = await this.prisma.anomalyNotification.findUnique({
      where: { id },
      include: { history: true, application: true },
    });
    if (!notification) {
      Logger.error({
        message: `Notification avec l'ID ${id} non trouvée.`,
        id: id,
        action: 'findOne',
      });
      throw new NotFoundException(`Notification avec l'id ${id} non trouvée`);
    }
    Logger.log({
      message: 'Notification trouvée avec succès.',
      notification: notification,
      action: 'findOne',
    });

    return notification;
  }

  public async getAnomalyNotificationByNotifierId(
    notifierId: string,
  ): Promise<GetAnomalyNotificationDto[]> {
    Logger.log({
      message: `Récupération des notifications pour le notifierId: ${notifierId}`,
      action: 'getAnomalyNotificationByNotifierId',
    });
    const anomalyNotifications = await this.prisma.anomalyNotification.findMany(
      {
        where: { notifierId },
        include: { history: true, application: true },
      },
    );
    if (!anomalyNotifications || anomalyNotifications.length === 0) {
      Logger.error({
        message: `Aucune notification trouvée pour notifierId: ${notifierId}`,
        notifierId: notifierId,
        action: 'getAnomalyNotificationByNotifierId',
      });
      throw new NotFoundException('Aucune notification de signalement trouvée');
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
      message: 'Notifications récupérées par notifierId.',
      notifierId: notifierId,
      count: anomalyNotificationDtos.length,
      action: 'getAnomalyNotificationByNotifierId',
    });

    return anomalyNotificationDtos;
  }

  public async getAnomalyNotificationByApplicationId(
    applicationId: string,
  ): Promise<GetAnomalyNotificationDto[]> {
    const anomalyNotifications = await this.prisma.anomalyNotification.findMany(
      {
        where: { applicationId },
        include: {
          history: true,
          application: true,
          notifier: true, // Inclure la relation vers 'User' pour récupérer les données de l'utilisateur
        },
      },
    );

    Logger.log(
      {
        message: 'notification by  app id',
        data: anomalyNotifications,
      },
      'create',
    );

    if (!anomalyNotifications || anomalyNotifications.length === 0) {
      Logger.error(
        {
          message: 'Aucune notification trouvée pour applicationId',
          applicationId: applicationId,
        },
        'getAnomalyNotificationByApplicationId',
      );
      throw new Error(
        'Aucune notification de signalement trouvée pour cette application',
      );
    }

    return anomalyNotifications.map((anomaly) => ({
      id: anomaly.id,
      applicationId: anomaly.applicationId,
      application: {
        id: anomaly.application?.id,
        label: anomaly.application?.label,
      },
      notifierId: anomaly.notifierId,
      notifier: {
        email: anomaly.notifier?.email || 'Non disponible', // Accéder à l'email de l'utilisateur via la relation
      },
      description: anomaly.description,
      status: anomaly.status,
      createdAt: anomaly.createdAt,
      updatedAt: anomaly.updatedAt || null,
    }));
  }
  /**
   * Met à jour une notification d'anomalie existante.
   * @param id L'identifiant de la notification.
   * @param data Les données de mise à jour.
   * @returns La notification d'anomalie mise à jour.
   * @throws NotFoundException Si la notification n'est pas trouvée.
   */
  async update(id: string, data: UpdateAnomalyNotificationDto) {
    Logger.log({
      message: `Mise à jour de la notification avec l'ID: ${id}`,
      data: data,
      action: 'update',
    });
    await this.findOne(id);

    const updatedNotification = await this.prisma.anomalyNotification.update({
      where: { id },
      data,
    });

    Logger.log({
      message: 'Notification mise à jour avec succès.',
      notification: updatedNotification,
      action: 'update',
    });

    return updatedNotification;
  }

  /**
   * Supprime une notification d'anomalie.
   * @param id L'identifiant de la notification.
   * @returns La notification d'anomalie supprimée.
   * @throws NotFoundException Si la notification n'est pas trouvée.
   */
  async remove(id: string) {
    try {
      Logger.log({
        message: `Suppression de la notification avec l'ID: ${id}`,
        action: 'remove',
      });

      await this.findOne(id);

      const deletedNotification = await this.prisma.anomalyNotification.delete({
        where: { id },
      });

      Logger.log({
        message: 'Notification supprimée avec succès.',
        notification: deletedNotification,
        action: 'remove',
      });

      return deletedNotification;
    } catch (error) {
      Logger.error({
        message: `Erreur lors de la suppression de la notification avec l'ID: ${id}`,
        error: error,
        action: 'remove',
      });
      throw error;
    }
  }
}
