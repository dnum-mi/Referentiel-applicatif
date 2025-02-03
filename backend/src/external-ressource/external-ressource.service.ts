import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExternalRessourceDto } from './dto/create-external-ressource.dto';

@Injectable()
export class ExternalRessourceService {
  constructor(private prisma: PrismaService) {}

  async createExternalRessource(
    createExternalRessourceDto: CreateExternalRessourceDto,
    ownerId: string,
  ) {
    // Crée d'abord un enregistrement `metadata` pour `ExternalSource`
    const metadata = await this.prisma.metadata.create({
      data: {
        createdById: ownerId,
        updatedById: ownerId,
        createdAt: new Date(),
      },
    });

    // Utilise l'ID de `metadata` nouvellement créé pour `metadataId`
    const newExternalRessource = await this.prisma.externalRessource.create({
      data: {
        ...createExternalRessourceDto,
        metadataId: metadata.id,
      },
    });

    return newExternalRessource;
  }
}
