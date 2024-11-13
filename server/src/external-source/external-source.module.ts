import { PrismaModule } from './../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ExternalSourceService } from './external-source.service';
import { ExternalSourceController } from './external-source.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ExternalSourceController],
  providers: [ExternalSourceService],
})
export class ExternalSourceModule {}
