// src/application/application.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateApplicationDto,
  PatchApplicationDto,
} from './dto/create-application.dto';
import { SearchApplicationDto } from './dto/search-application.dto';
import { GetApplicationDto } from './dto/get-application.dto';
import { Prisma, Application } from '@prisma/client';

@Injectable()
export class ApplicationService {
  applications: any;
  constructor(private prisma: PrismaService) {}

  public async createApplication(
    ownerId: string,
    createApplicationDto: CreateApplicationDto,
  ) {
    Logger.warn(`Creating application with ownerId: ${ownerId}`);
    for (const actor of createApplicationDto.actors) {
      const userExists = await this.prisma.user.findUnique({
        where: { id: actor.userId },
      });
      Logger.warn('actor', JSON.stringify(actor));
      if (!userExists) {
        throw new BadRequestException(
          `User with ID ${actor.userId} does not exist.`,
        );
      }
    }

    const applicationMetadata = await this.createApplicationMetadata(ownerId);
    const application = await this.persistApplication(
      ownerId,
      applicationMetadata.id,
      createApplicationDto,
    );
    return application;
  }

  async update(params: {
    where: Prisma.ApplicationWhereUniqueInput;
    data: PatchApplicationDto;
  }): Promise<Application> {
    const { where, data } = params;
    return this.prisma.application.update({
      data,
      where,
    });
  }

  public async searchApplications(searchParams: SearchApplicationDto) {
    const { label, page = 1, limit = 12 } = searchParams;

    const whereClause: Prisma.ApplicationWhereInput = {
      ...(label
        ? {
            label: {
              contains: label,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {}),
    };

    const orderByClause: Prisma.Enumerable<Prisma.ApplicationOrderByWithRelationInput> =
      {
        metadata: {
          updatedAt: 'desc',
        },
      };

    const skip = (page - 1) * limit;

    try {
      const applications = await this.prisma.application.findMany({
        where: whereClause,
        orderBy: orderByClause,
        take: limit,
        skip: skip,
        include: {
          lifecycle: true,
          actors: true,
          metadata: true,
        },
      });

      return applications;
    } catch (error) {
      throw error;
    }
  }

  public async getApplicationById(id: string): Promise<GetApplicationDto> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        lifecycle: true,
        actors: true,
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const applicationDto: GetApplicationDto = {
      id: application.id,
      label: application.label,
      shortName: application.shortName || null,
      logo: application.logo || null,
      description: application.description,
      purposes: application.purposes,
      tags: application.tags,
      lifecycleId: application.lifecycleId || null,
      parentId: application.parentId || null,
    };

    return applicationDto;
  }

  public async getApplications() {
    return await this.prisma.application.findMany();
  }

  private async createApplicationMetadata(ownerId: string) {
    const applicationMetadata = await this.prisma.metadata.create({
      data: {
        createdById: ownerId,
        updatedById: ownerId,
        createdAt: new Date(),
      },
    });

    return applicationMetadata;
  }

  private async persistApplication(
    ownerId: string,
    applicationMetadataId: string,
    createApplicationDto,
  ) {
    const application = await this.prisma.application.create({
      data: {
        label: createApplicationDto.label,
        shortName: createApplicationDto.shortName || null,
        logo: createApplicationDto.logo || null,
        description: createApplicationDto.description,
        purposes: createApplicationDto.purposes,
        tags: createApplicationDto.tags,
        metadata: { connect: { id: applicationMetadataId } },
        owner: { connect: { id: ownerId } },
        lifecycle: {
          create: {
            status: createApplicationDto.lifecycle.status,
            firstProductionDate: new Date(
              createApplicationDto.lifecycle.firstProductionDate || null,
            ),
            plannedDecommissioningDate: createApplicationDto.lifecycle
              .plannedDecommissioningDate
              ? new Date(
                  createApplicationDto.lifecycle.plannedDecommissioningDate,
                )
              : undefined,
            metadata: { connect: { id: applicationMetadataId } },
          },
        },
        actors: {
          create: Array.isArray(createApplicationDto.actors)
            ? createApplicationDto.actors.map((actorDto) => ({
                role: actorDto.role,
                user: { connect: { id: actorDto.userId } },
                externalOrganization: actorDto.organizationId
                  ? { connect: { id: actorDto.organizationId } }
                  : undefined,
              }))
            : [],
        },
        compliances: {
          create: createApplicationDto.compliances.map((compliance) => ({
            ...compliance,
            validityStart: compliance.validityStart
              ? new Date(compliance.validityStart)
              : undefined,
            validityEnd: compliance.validityEnd
              ? new Date(compliance.validityEnd)
              : undefined,
          })),
        },
        externals: {
          create: createApplicationDto.externals.map((external) => ({
            externalSource: { connect: { id: external.externalSourceId } }, // Connexion via la relation
            value: external.value,
            label: external.label,
            shortName: external.shortName,
            lastSourceUpdate: new Date(external.lastSourceUpdate),
            metadata: { connect: { id: applicationMetadataId } },
          })),
        },
        parent: createApplicationDto.parentId
          ? { connect: { id: createApplicationDto.parentId } }
          : undefined,
      },
      include: {
        lifecycle: { include: { metadata: true } },
        metadata: true,
        actors: true,
        compliances: true,
        externals: true,
      },
    });
    return application;
  }
}
