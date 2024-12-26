import { Module } from '@nestjs/common';
import { AnomalyNotificationService } from './anomaly-notification.service';
import { AnomalyNotificationController } from './anomaly-notification.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnomalyNotificationController],
  providers: [AnomalyNotificationService],
  exports: [AnomalyNotificationService],
})
export class AnomalyNotificationModule {}
