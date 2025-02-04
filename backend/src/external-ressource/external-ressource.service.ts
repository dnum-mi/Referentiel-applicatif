import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExternalRessourceDto } from './dto/create-external-ressource.dto';

@Injectable()
export class ExternalRessourceService {
  constructor(private prisma: PrismaService) {}

  async createExternalRessource(
    createExternalRessourceDto: CreateExternalRessourceDto,
    applicationId: string,
  ) {
    const newExternalRessource = await this.prisma.externalRessource.create({
      data: {
        ...createExternalRessourceDto,
        applicationId,
      },
    });

    return newExternalRessource;
  }
}
