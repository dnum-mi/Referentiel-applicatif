import { PartialType } from '@nestjs/mapped-types';
import { CreateAnomalyNotificationDto } from './create-anomaly-notification.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { AnomalyNotificationStatus } from '@prisma/client';

export class UpdateAnomalyNotificationDto extends PartialType(
  CreateAnomalyNotificationDto,
) {
  @IsOptional()
  @IsEnum(AnomalyNotificationStatus)
  status?: AnomalyNotificationStatus;
}
