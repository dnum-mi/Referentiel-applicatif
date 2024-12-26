import { IsString, IsOptional, IsEnum } from 'class-validator';
import { AnomalyNotificationStatus } from '@prisma/client';

export class CreateAnomalyNotificationDto {
  @IsString()
  applicationId: string;

  @IsString()
  notifierId: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(AnomalyNotificationStatus)
  status?: AnomalyNotificationStatus;
}
