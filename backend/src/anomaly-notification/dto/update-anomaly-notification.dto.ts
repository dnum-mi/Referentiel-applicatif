import { PartialType } from '@nestjs/mapped-types';
import { CreateAnomalyNotificationDto } from './create-anomaly-notification.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { AnomalyNotificationStatus } from '../../enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAnomalyNotificationDto extends PartialType(
  CreateAnomalyNotificationDto,
) {
  @IsOptional()
  @IsEnum(AnomalyNotificationStatus)
  @ApiProperty({
    description: "Le nouveau statut de la notification d'anomalie",
    enum: AnomalyNotificationStatus, // Ceci permet d’afficher l’enum dans Swagger
    required: true, // Le statut est optionnel
  })
  status?: AnomalyNotificationStatus;
}
