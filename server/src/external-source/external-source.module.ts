import { PrismaModule } from './../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ExternalSourceService } from './external-source.service';
import { ExternalSourceController } from './external-source.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [ExternalSourceController],
  providers: [ExternalSourceService],
})
export class ExternalSourceModule {}
