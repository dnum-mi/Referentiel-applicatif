// src/application/application.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { SearchApplicationDto } from './dto/search-application.dto';
import { GetApplicationDto } from './dto/get-application.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApplicationService {
  applications: any;
  private readonly BASE_URL_APPLICATION: string;
  private readonly BASE_URL_API: string;
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.BASE_URL_APPLICATION = this.configService.get<string>(
      'BASE_URL_APPLICATION',
    );
    this.BASE_URL_API = this.configService.get<string>('BASE_URL_API');
  }

  public async createApplication(
    ownerId: string,
    createApplicationDto: CreateApplicationDto,
  ) {
    Logger.warn(`Creating application with ownerId: ${ownerId}`);
    for (const actor of createApplicationDto.actors) {
      const userExists = await this.prisma.user.findUnique({
        where: { keycloakId: actor.userId },
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
    const updatedApplication = await this.updateApplicationUrls(application.id);
    return updatedApplication;
  }

  public async updateApplication(
    applicationId: string,
    applicationToUpdate: UpdateApplicationDto,
  ) {
    try {
      const isAppplicationExist = await this.isApplicationExist(applicationId);
      if (!isAppplicationExist) {
        throw new NotFoundException('Application not found');
      }

      const hasApplicationMetadata = await this.hasApplicationMetadata(
        applicationToUpdate?.metadataId,
      );
      if (!hasApplicationMetadata) {
        throw new NotFoundException('Metadata not found');
      }

      const hasParent = await this.hasParent(applicationToUpdate?.parentId);
      if (!hasParent) {
        throw new NotFoundException('Parent application not found');
      }

      if (applicationToUpdate.parentId === applicationId) {
        throw new BadRequestException(
          'An application cannot be its own parent',
        );
      }

      return await this.prisma.$transaction(async () => {
        return await this.persistApplicationToUpdate(
          applicationId,
          applicationToUpdate,
        );
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update application');
    }
  }

  public async searchApplications(searchParams: SearchApplicationDto) {
    return await this.prisma.application.findMany({
      where: {
        label: {
          contains: searchParams.label,
          mode: 'insensitive',
        },
      },
    });
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
      shortName: application.shortName,
      logo: application.logo,
      description: application.description,
      url: application.url,
      uri: application.uri,
      purposes: application.purposes,
      tags: application.tags,
      lifecycleId: application.lifecycleId,
      parentId: application.parentId || null,
    };

    return applicationDto;
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
        shortName: createApplicationDto.shortName,
        logo: createApplicationDto.logo,
        description: createApplicationDto.description,
        url: createApplicationDto.url || this.BASE_URL_APPLICATION,
        uri: createApplicationDto.uri || this.BASE_URL_API,
        purposes: createApplicationDto.purposes,
        tags: createApplicationDto.tags,
        metadata: { connect: { id: applicationMetadataId } },
        owner: { connect: { keycloakId: ownerId } },
        lifecycle: {
          create: {
            status: createApplicationDto.lifecycle.status,
            firstProductionDate: new Date(
              createApplicationDto.lifecycle.firstProductionDate,
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
                user: { connect: { keycloakId: actorDto.userId } },
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

  private async updateApplicationUrls(applicationId: string) {
    return await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        url: `${this.BASE_URL_APPLICATION}/${applicationId}`,
        uri: `${this.BASE_URL_API}/${applicationId}`,
      },
      include: {
        lifecycle: { include: { metadata: true } },
        metadata: true,
        actors: true,
        compliances: true,
      },
    });
  }

  private async isApplicationExist(applicationId: string): Promise<boolean> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    return !!application;
  }

  private async hasApplicationMetadata(
    applicationMetadataId: string,
  ): Promise<boolean> {
    const metadata = await this.prisma.metadata.findUnique({
      where: { id: applicationMetadataId },
    });
    return !!metadata;
  }

  private async hasParent(applicationParentId: string): Promise<boolean> {
    const parent = await this.prisma.application.findUnique({
      where: { id: applicationParentId },
    });
    return !!parent;
  }

  //TODO : VERIFIER QUE ID EST DANS APPLICATION TO UPDATE
  private async persistApplicationToUpdate(
    applicationId: string,
    applicationToUpdate: UpdateApplicationDto,
  ) {
    return await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        label: applicationToUpdate.label,
        shortName: applicationToUpdate.shortName,
        logo: applicationToUpdate.logo,
        description: applicationToUpdate.description,
        purposes: applicationToUpdate.purposes,
        tags: applicationToUpdate.tags,
        parent: applicationToUpdate.parentId
          ? {
              connect: { id: applicationToUpdate.parentId },
            }
          : {
              disconnect: true,
            },
        metadata: applicationToUpdate.metadataId
          ? {
              connect: { id: applicationToUpdate.metadataId },
            }
          : undefined,
        lifecycle: applicationToUpdate.lifecycle
          ? {
              update: {
                status: applicationToUpdate.lifecycle.status,
                firstProductionDate: applicationToUpdate.lifecycle
                  .firstProductionDate
                  ? new Date(applicationToUpdate.lifecycle.firstProductionDate)
                  : undefined,
                plannedDecommissioningDate: applicationToUpdate.lifecycle
                  .plannedDecommissioningDate
                  ? new Date(
                      applicationToUpdate.lifecycle.plannedDecommissioningDate,
                    )
                  : undefined,
                metadata: applicationToUpdate.lifecycle.metadataId
                  ? {
                      connect: { id: applicationToUpdate.lifecycle.metadataId },
                    }
                  : undefined,
              },
            }
          : undefined,
        actors: applicationToUpdate.actors
          ? {
              deleteMany: {},
              create: applicationToUpdate.actors.map((actor) => ({
                role: actor.role,
                user: {
                  connect: { keycloakId: actor.userId },
                },
                organization: actor.organizationId
                  ? { connect: { id: actor.organizationId } }
                  : undefined,
              })),
            }
          : undefined,
        compliances: applicationToUpdate.compliances
          ? {
              deleteMany: {},
              create: applicationToUpdate.compliances.map((compliance) => ({
                type: compliance.type,
                name: compliance.name,
                status: compliance.status,
                validityStart: compliance.validityStart
                  ? new Date(compliance.validityStart)
                  : undefined,
                validityEnd: compliance.validityEnd
                  ? new Date(compliance.validityEnd)
                  : undefined,
                scoreValue: compliance.scoreValue,
                scoreUnit: compliance.scoreUnit,
                notes: compliance.notes,
              })),
            }
          : undefined,
      },
      include: {
        lifecycle: {
          include: {
            metadata: true,
          },
        },
        metadata: true,
        parent: true,
        children: true,
        actors: true,
        compliances: true,
      },
    });
  }
}
