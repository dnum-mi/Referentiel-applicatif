// src/application/application.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { SearchApplicationDto } from './dto/search-application.dto';
import { GetApplicationDto } from './dto/get-application.dto';

@Injectable()
export class ApplicationService {
  applications: any;
  constructor(private  prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto, ownerId: string) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        
        let metadata = await prisma.metadata.findUnique({
          where: { id: createApplicationDto.metadataId },
        });
 
      if (!metadata) {
        metadata = await this.prisma.metadata.create({
          data: {
        id: createApplicationDto.metadataId,
        createdById: ownerId,
        updatedById: ownerId,
        DateTime: new Date(),
      },
    });
  }
        const lifecycleMetadata = await prisma.metadata.findUnique({
          where: { id: createApplicationDto.lifecycle.metadataId },
        });
        if (!lifecycleMetadata) {
          throw new NotFoundException('Metadata for lifecycle not found');
        }

        // Vérifier l'existence du parent si parentId est fourni
        if (createApplicationDto.parentId) {
          const parentApp = await prisma.application.findUnique({
            where: { id: createApplicationDto.parentId },
          });
          if (!parentApp) {
            throw new NotFoundException('Parent application not found');
          }

          // Vérifier qu'il n'y a pas de cycle dans la hiérarchie
          let currentParentId = createApplicationDto.parentId;
          while (currentParentId) {
            if (currentParentId === ownerId) { // Cette vérification est incorrecte; à adapter selon les besoins
              throw new BadRequestException('An application cannot be its own parent');
            }
            const parent = await prisma.application.findUnique({
              where: { id: currentParentId },
              select: { parentId: true },
            });
            if (parent && parent.parentId) {
              currentParentId = parent.parentId;
            } else {
              break;
            }
          }
        }

        // Vérifier l'existence des utilisateurs et organisations dans les acteurs
        for (const acteur of createApplicationDto.acteurs) {
          const user = await prisma.user.findUnique({
            where: { keycloakId: acteur.userId },
          });
          if (!user) {
            throw new NotFoundException(`User with id ${acteur.userId} not found`);
          }

          if (acteur.organizationId) {
            const organization = await prisma.reference.findUnique({
              where: { id: acteur.organizationId },
            });
            if (!organization) {
              throw new NotFoundException(`Organization with id ${acteur.organizationId} not found`);
            }
          }
        }

        // Créer l'application avec les relations
        const application = await prisma.application.create({
          data: {
            label: createApplicationDto.label,
            shortname: createApplicationDto.shortname,
            logo: createApplicationDto.logo,
            description: createApplicationDto.description,
            url: createApplicationDto.url,
            uri: createApplicationDto.uri,
            purposes: createApplicationDto.purposes,
            tags: createApplicationDto.tags,
            parent: createApplicationDto.parentId
              ? {
                  connect: { id: createApplicationDto.parentId },
                }
              : undefined,
            lifecycle: {
              create: {
                status: createApplicationDto.lifecycle.status,
                firstProductionDate: new Date(createApplicationDto.lifecycle.firstProductionDate),
                plannedDecommissioningDate: createApplicationDto.lifecycle.plannedDecommissioningDate
                  ? new Date(createApplicationDto.lifecycle.plannedDecommissioningDate)
                  : undefined,
                metadata: {
                  connect: { id: createApplicationDto.lifecycle.metadataId },
                },
              },
            },
            metadata: {
              connect: { id: createApplicationDto.metadataId },
            },
            acteurs: {
              create: createApplicationDto.acteurs.map(acteur => ({
                role: acteur.role,
                user: {
                  connect: { keycloakId: acteur.userId },
                },
                organization: acteur.organizationId
                  ? { connect: { id: acteur.organizationId } }
                  : undefined,
              })),
            },
            compliances: {
              create: createApplicationDto.compliances.map(compliance => ({
                type: compliance.type,
                name: compliance.name,
                status: compliance.status,
                validityStart: compliance.validityStart ? new Date(compliance.validityStart) : undefined,
                validityEnd: compliance.validityEnd ? new Date(compliance.validityEnd) : undefined,
                scoreValue: compliance.scoreValue,
                scoreUnit: compliance.scoreUnit,
                notes: compliance.notes,
              })),
            },
            owner: {
              connect: { keycloakId: ownerId },
            },
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
            acteurs: true,
            externalReferences: true,
            compliances: true,
            environments: true,
            owner: true,
          },
        });

        return application;
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create application');
    }
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

        // Vérifier l'existence des utilisateurs et organisations dans les acteurs si acteurs sont fournis
        if (updateApplicationDto.acteurs) {
          for (const acteur of updateApplicationDto.acteurs) {
            const user = await prisma.user.findUnique({
              where: { keycloakId: acteur.userId },
            });
            if (!user) {
              throw new NotFoundException(`User with id ${acteur.userId} not found`);
            }

            if (acteur.organizationId) {
              const organization = await prisma.reference.findUnique({
                where: { id: acteur.organizationId },
              });
              if (!organization) {
                throw new NotFoundException(`Organization with id ${acteur.organizationId} not found`);
              }
            }
          }
        }

        // Mettre à jour l'application avec les nouvelles données
        const updatedApplication = await prisma.application.update({
          where: { id },
          data: {
            label: updateApplicationDto.label,
            shortname: updateApplicationDto.shortname,
            logo: updateApplicationDto.logo,
            description: updateApplicationDto.description,
            url: updateApplicationDto.url,
            uri: updateApplicationDto.uri,
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
            acteurs: updateApplicationDto.acteurs
              ? {
                  // Pour simplifier, on peut déconnecter et recréer les acteurs
                  deleteMany: {},
                  create: updateApplicationDto.acteurs.map(acteur => ({
                    role: acteur.role,
                    user: {
                      connect: { keycloakId: acteur.userId },
                    },
                    organization: acteur.organizationId
                      ? { connect: { id: acteur.organizationId } }
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
            acteurs: true,
            externalReferences: true,
            compliances: true,
            environments: true,
            owner: true,
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
        owner: true,
        acteurs: true,
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const applicationDto: GetApplicationDto = {
      id: application.id,
      label: application.label,
      shortname: application.shortname,
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