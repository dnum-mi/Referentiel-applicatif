import { PrismaModule } from '../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ExternalRessourceService } from './external-ressource.service';
import { ExternalRessourceController } from './external-ressource.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [ExternalRessourceController],
  providers: [ExternalRessourceService],
})
export class ExternalSourceModule {}
