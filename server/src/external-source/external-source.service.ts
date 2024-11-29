import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExternalSourceDto } from './dto/create-external-source.dto';

@Injectable()
export class ExternalSourceService {
  constructor(private prisma: PrismaService) {}

  async createExternalSource(
    createExternalSourceDto: CreateExternalSourceDto,
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
    const newExternalSource = await this.prisma.externalSource.create({
      data: {
        ...createExternalSourceDto,
        metadataId: metadata.id,
      },
    });

    return newExternalSource;
  }
}
