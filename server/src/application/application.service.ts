// src/application/application.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { SearchApplicationDto } from './dto/search-application.dto';
import { GetApplicationDto } from './dto/get-application.dto';

@Injectable()
export class ApplicationService {
  applications: any;
  constructor(private  prisma: PrismaService) {}

  
  async createApplication(createApplicationDto: CreateApplicationDto, ownerId) {
    const BASE_URL_APPLICATION = process.env.BASE_URL_APPLICATION;
    const BASE_URL_API = process.env.BASE_URL_API;
  
    Logger.warn(`Creating application with ownerId: ${ownerId}`);
  
    for (const actor of createApplicationDto.actors) {
      const userExists = await this.prisma.user.findUnique({
        where: { keycloakId: actor.userId },
      });
  
      if (!userExists) {
        throw new BadRequestException(`User with ID ${actor.userId} does not exist.`);
      }
    }
  
    // Créer les métadonnées de l'application
    const applicationMetadata = await this.prisma.metadata.create({
      data: {
        createdById: ownerId,
        updatedById: ownerId,
        createdAt: new Date(),
      },
    });
  
    const lifecycleMetadata = await this.prisma.metadata.create({
      data: {
        createdById: ownerId,
        updatedById: ownerId,
        createdAt: new Date(),
      },
    });
  
    // Créer l'application
    const application = await this.prisma.application.create({
      data: {
        label: createApplicationDto.label,
        shortName: createApplicationDto.shortName,
        logo: createApplicationDto.logo,
        description: createApplicationDto.description,
        url: createApplicationDto.url || BASE_URL_APPLICATION,
        uri: createApplicationDto.uri || BASE_URL_API,
        purposes: createApplicationDto.purposes,
        tags: createApplicationDto.tags,
        metadata: { connect: { id: applicationMetadata.id } },
        owner: { connect: { keycloakId: ownerId } },
        lifecycle: {
          create: {
            status: createApplicationDto.lifecycle.status,
            firstProductionDate: new Date(createApplicationDto.lifecycle.firstProductionDate),
            plannedDecommissioningDate: createApplicationDto.lifecycle.plannedDecommissioningDate
              ? new Date(createApplicationDto.lifecycle.plannedDecommissioningDate)
              : undefined,
            metadata: { connect: { id: lifecycleMetadata.id } },
          },
        },
        actors: {
          create: createApplicationDto.actors.map((actor) => ({
            role: actor.role,
            user: { connect: { keycloakId: actor.userId } },
            organization: actor.organizationId
              ? { connect: { id: actor.organizationId } }
              : undefined,
          })),
        },
        compliances: {
          create: createApplicationDto.compliances.map((compliance) => ({
            ...compliance,
            validityStart: compliance.validityStart ? new Date(compliance.validityStart) : undefined,
            validityEnd: compliance.validityEnd ? new Date(compliance.validityEnd) : undefined,
          })),
        },
        externals: {
          create: createApplicationDto.externals.map((external) => ({
            externalSource: { connect: { id: external.externalSourceId } }, // Add this line
            externalSourceId: external.externalSourceId,
            value: external.value,
            label: external.label,
            shortName: external.shortName,
            lastSourceUpdate: new Date(external.lastSourceUpdate),
            metadata: { connect: { id: applicationMetadata.id } },
          })),
        },
        parent: createApplicationDto.parentId ? { connect: { id: createApplicationDto.parentId } } : undefined,
      },
      include: {
        lifecycle: { include: { metadata: true } },
        metadata: true,
        actors: true,
        compliances: true,
        externals: true,
      },
    });
  
    // Mise à jour des URL avec l'ID de l'application
    const applicationId = application.id;
    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        url: `${BASE_URL_APPLICATION}/${applicationId}`,
        uri: `${BASE_URL_API}/${applicationId}`,
      },
      include: {
        lifecycle: { include: { metadata: true } },
        metadata: true,
        actors: true,
        compliances: true,
      },
    });
  
    return updatedApplication;
  }
  
  async update(id: string, updateApplicationDto: UpdateApplicationDto) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Vérifier si l'application existe
        const existingApplication = await prisma.application.findUnique({
          where: { id },
        });
        if (!existingApplication) {
          throw new NotFoundException('Application not found');
        }

        // Vérifier si metadataId est fourni et existe
        if (updateApplicationDto.metadataId) {
          const metadata = await prisma.metadata.findUnique({
            where: { id: updateApplicationDto.metadataId },
          });
          if (!metadata) {
            throw new NotFoundException('Metadata not found');
          }
        }

        // Vérifier si parentId est fourni et existe
        if (updateApplicationDto.parentId) {
          const parent = await prisma.application.findUnique({
            where: { id: updateApplicationDto.parentId },
          });
          if (!parent) {
            throw new NotFoundException('Parent application not found');
          }
          // Éviter les cycles dans la hiérarchie parent-enfant
          if (updateApplicationDto.parentId === id) {
            throw new BadRequestException('An application cannot be its own parent');
          }

          // Vérification plus approfondie des cycles
          let currentParentId = updateApplicationDto.parentId;
          while (currentParentId) {
            if (currentParentId === id) {
              throw new BadRequestException('Cycle detected in parent hierarchy');
            }
            const currentParent = await prisma.application.findUnique({
              where: { id: currentParentId },
              select: { parentId: true },
            });
            if (currentParent && currentParent.parentId) {
              currentParentId = currentParent.parentId;
            } else {
              break;
            }
          }
        }

        const updatedApplication = await prisma.application.update({
          where: { id },
          data: {
            label: updateApplicationDto.label,
            shortName: updateApplicationDto.shortName,
            logo: updateApplicationDto.logo,
            description: updateApplicationDto.description,
            purposes: updateApplicationDto.purposes,
            tags: updateApplicationDto.tags,
            parent: updateApplicationDto.parentId
              ? {
                  connect: { id: updateApplicationDto.parentId },
                }
              : {
                  disconnect: true,
                },
            metadata: updateApplicationDto.metadataId
              ? {
                  connect: { id: updateApplicationDto.metadataId },
                }
              : undefined,
            lifecycle: updateApplicationDto.lifecycle
              ? {
                  update: {
                    status: updateApplicationDto.lifecycle.status,
                    firstProductionDate: updateApplicationDto.lifecycle.firstProductionDate
                      ? new Date(updateApplicationDto.lifecycle.firstProductionDate)
                      : undefined,
                    plannedDecommissioningDate: updateApplicationDto.lifecycle.plannedDecommissioningDate
                      ? new Date(updateApplicationDto.lifecycle.plannedDecommissioningDate)
                      : undefined,
                    metadata: updateApplicationDto.lifecycle.metadataId
                      ? { connect: { id: updateApplicationDto.lifecycle.metadataId } }
                      : undefined,
                  },
                }
              : undefined,
            actors: updateApplicationDto.actors
              ? {
                  deleteMany: {},
                  create: updateApplicationDto.actors.map(actor => ({
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
            compliances: updateApplicationDto.compliances
              ? {
                  deleteMany: {},
                  create: updateApplicationDto.compliances.map(compliance => ({
                    type: compliance.type,
                    name: compliance.name,
                    status: compliance.status,
                    validityStart: compliance.validityStart ? new Date(compliance.validityStart) : undefined,
                    validityEnd: compliance.validityEnd ? new Date(compliance.validityEnd) : undefined,
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

        return updatedApplication;
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update application');
    }
  }

  async searchApplications(searchParams: SearchApplicationDto) {
    const { label } = searchParams;
    const applications = await this.prisma.application.findMany({
      where: {
        label: {
          contains: label,
          mode: 'insensitive',
        },
      },
    });
  
    return applications;
  }

  async getApplicationById(id: string): Promise<GetApplicationDto> {
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
}