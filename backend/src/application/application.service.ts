// src/application/application.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateApplicationDto,
  PatchApplicationDto,
  UpdateActorDto,
  UpdateComplianceDto,
} from './dto/create-application.dto';
import { SearchApplicationDto } from './dto/search-application.dto';
import { Prisma, Application } from '@prisma/client';

@Injectable()
export class ApplicationService {
  applications: any;
  constructor(private prisma: PrismaService) {}

  /**
   * Crée une nouvelle application.
   *
   * @param ownerId L'identifiant du propriétaire de l'application.
   * @param createApplicationDto Les données nécessaires à la création de l'application.
   *
   * @returns L'application nouvellement créée.
   * @throws BadRequestException Si un utilisateur référencé dans les acteurs n'existe pas.
   */
  public async createApplication(
    ownerId: string,
    createApplicationDto: CreateApplicationDto,
  ) {
    for (const actor of createApplicationDto.actors) {
      const userExists = await this.prisma.user.findUnique({
        where: { keycloakId: actor.userId },
      });

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

  /**
   * Met à jour une application existante.
   *
   * @param params Contient l'ID de l'application et les données à mettre à jour.
   *
   * @returns L'application mise à jour.
   * @throws NotFoundException Si l'application à mettre à jour n'est pas trouvée.
   */
  public async update(params: {
    where: Prisma.ApplicationWhereUniqueInput;
    data: PatchApplicationDto;
  }): Promise<Application> {
    const { where, data } = params;
    const applicationUpdates: Prisma.ApplicationUpdateInput = {};

    this.applyScalarAndSimpleRelationUpdates(data, applicationUpdates);

    if (data.compliances !== undefined) {
      await this.applyComplianceUpdates(
        where.id,
        data.compliances,
        applicationUpdates,
      );
    }

    if (data.actors !== undefined) {
      await this.applyActorUpdates(where.id, data.actors, applicationUpdates);
    }

    try {
      const updatedApplication = await this.prisma.application.update({
        where,
        data: applicationUpdates,
      });

      return updatedApplication;
    } catch (error) {
      throw new NotFoundException(
        `Application non trouvée pour l'ID: ${where.id}`,
      );
    }
  }

  /**
   * Recherche des applications selon les critères fournis.
   *
   * @param searchParams Les paramètres de recherche.
   *
   * @returns La liste des applications qui correspondent aux critères de recherche.
   * @throws Error Si une erreur survient pendant la recherche.
   */
  public async searchApplications(searchParams: SearchApplicationDto) {
    const { label, tag, page = 1, limit = 12 } = searchParams;

    const whereClause: Prisma.ApplicationWhereInput = {
      ...(label !== undefined && {
        label: {
          contains: label,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...(tag && {
        tags: {
          hasEvery: tag,
        },
      }),
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

  /**
   * Récupère une application spécifique par son ID.
   *
   * @param id L'identifiant de l'application à récupérer.
   *
   * @returns L'application trouvée.
   * @throws NotFoundException Si l'application n'est pas trouvée.
   */
  public async getApplicationById(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        lifecycle: {
          include: { metadata: true },
        },
        actors: {
          include: {
            user: true,
            externalOrganization: true,
          },
        },
        compliances: true,
        externals: {
          include: { externalSource: true },
        },
        parent: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  /**
   * Récupère toutes les applications.
   *
   * @returns La liste de toutes les applications.
   * @throws Error Si une erreur survient pendant la récupération des applications.
   */
  public async getApplications() {
    try {
      const applications = await this.prisma.application.findMany();
      return applications;
    } catch (error) {
      throw error;
    }
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
        owner: { connect: { keycloakId: ownerId } },
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

  private applyScalarAndSimpleRelationUpdates(
    data: PatchApplicationDto,
    applicationUpdates: Prisma.ApplicationUpdateInput,
  ): void {
    if (data.label !== undefined) {
      applicationUpdates.label = data.label;
    }
    if (data.shortName !== undefined) {
      applicationUpdates.shortName = data.shortName;
    }
    if (data.description !== undefined) {
      applicationUpdates.description = data.description;
    }
    if (data.purposes !== undefined) {
      applicationUpdates.purposes = { set: data.purposes };
    }
    if (data.tags !== undefined) {
      applicationUpdates.tags = { set: data.tags };
    }
    if (data.parentId !== undefined) {
      applicationUpdates.parent = data.parentId
        ? { connect: { id: data.parentId } }
        : { disconnect: true };
    }
    if (data.lifecycle !== undefined) {
      applicationUpdates.lifecycle = {
        update: {
          ...(data.lifecycle.status !== undefined && {
            status: data.lifecycle.status,
          }),
          ...(data.lifecycle.firstProductionDate !== undefined && {
            firstProductionDate: data.lifecycle.firstProductionDate,
          }),
          ...(data.lifecycle.plannedDecommissioningDate !== undefined && {
            plannedDecommissioningDate:
              data.lifecycle.plannedDecommissioningDate,
          }),
        },
      };
    }
  }

  private async applyComplianceUpdates(
    applicationId: string,
    incomingComplianceDtos: UpdateComplianceDto[],
    applicationUpdates: Prisma.ApplicationUpdateInput,
  ): Promise<void> {
    const existingComplianceRecords = await this.prisma.compliance.findMany({
      where: { applicationId },
      select: { id: true },
    });

    const existingComplianceIds = existingComplianceRecords.map((c) => c.id);
    const incomingComplianceIds = this.getIncomingComplianceIds(
      incomingComplianceDtos,
    );

    const complianceIdsToDelete = this.findComplianceIdsToDelete(
      existingComplianceIds,
      incomingComplianceIds,
    );
    const compliancesToCreate = this.findCompliancesToCreate(
      incomingComplianceDtos,
    );
    const compliancesToUpdate = this.findCompliancesToUpdate(
      incomingComplianceDtos,
      existingComplianceIds,
    );

    applicationUpdates.compliances = {
      delete: complianceIdsToDelete.map((id) => ({ id })),
      update: this.buildComplianceUpdateList(compliancesToUpdate),
      create: this.buildComplianceCreateList(compliancesToCreate),
    };
  }

  private getIncomingComplianceIds(dtos: UpdateComplianceDto[]): string[] {
    return dtos.filter((dto) => dto.id).map((dto) => dto.id as string);
  }

  private findComplianceIdsToDelete(
    existingIds: string[],
    incomingIds: string[],
  ): string[] {
    return existingIds.filter((id) => !incomingIds.includes(id));
  }

  private findCompliancesToCreate(
    dtos: UpdateComplianceDto[],
  ): UpdateComplianceDto[] {
    return dtos.filter((dto) => !dto.id);
  }

  private findCompliancesToUpdate(
    dtos: UpdateComplianceDto[],
    existingIds: string[],
  ): UpdateComplianceDto[] {
    return dtos.filter((dto) => dto.id && existingIds.includes(dto.id));
  }

  private buildComplianceUpdateList(
    dtos: UpdateComplianceDto[],
  ): Prisma.ComplianceUpdateWithWhereUniqueWithoutApplicationInput[] {
    return dtos.map((dto) => ({
      where: { id: dto.id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.validityStart !== undefined && {
          validityStart: dto.validityStart ? new Date(dto.validityStart) : null,
        }),
        ...(dto.validityEnd !== undefined && {
          validityEnd: dto.validityEnd ? new Date(dto.validityEnd) : null,
        }),
        ...(dto.scoreValue !== undefined && { scoreValue: dto.scoreValue }),
        ...(dto.scoreUnit !== undefined && { scoreUnit: dto.scoreUnit }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    }));
  }

  private buildComplianceCreateList(
    dtos: UpdateComplianceDto[],
  ): Prisma.ComplianceCreateWithoutApplicationInput[] {
    return dtos.map((dto) => ({
      type: dto.type,
      name: dto.name,
      status: dto.status,
      validityStart: dto.validityStart ? new Date(dto.validityStart) : null,
      validityEnd: dto.validityEnd ? new Date(dto.validityEnd) : null,
      scoreValue: dto.scoreValue,
      scoreUnit: dto.scoreUnit,
      notes: dto.notes,
    }));
  }

  private async applyActorUpdates(
    applicationId: string,
    incomingActorDtos: UpdateActorDto[],
    applicationUpdates: Prisma.ApplicationUpdateInput,
  ): Promise<void> {
    const existingActors = await this.prisma.actor.findMany({
      where: { applicationId },
      select: { id: true },
    });

    const existingActorIds = existingActors.map((a) => a.id);
    const incomingActorIds = incomingActorDtos
      .filter((a) => a.id)
      .map((a) => a.id as string);

    const actorsToCreate = this.findActorsToCreate(incomingActorDtos);
    const actorsToUpdate = this.findActorsToUpdate(
      incomingActorDtos,
      existingActorIds,
    );
    const actorIdsToDelete = this.findActorIdsToDelete(
      existingActorIds,
      incomingActorIds,
    );

    applicationUpdates.actors = {
      delete: actorIdsToDelete.map((id) => ({ id })),
      update: this.buildActorUpdateList(actorsToUpdate),
      create: this.buildActorCreateList(actorsToCreate, applicationId),
    };
  }

  private findActorsToCreate(dtos: UpdateActorDto[]): UpdateActorDto[] {
    return dtos.filter((dto) => !dto.id);
  }

  private findActorsToUpdate(
    dtos: UpdateActorDto[],
    existingIds: string[],
  ): UpdateActorDto[] {
    return dtos.filter((dto) => dto.id && existingIds.includes(dto.id));
  }

  private findActorIdsToDelete(
    existingIds: string[],
    incomingIds: string[],
  ): string[] {
    return existingIds.filter((id) => !incomingIds.includes(id));
  }

  private buildActorUpdateList(
    dtos: UpdateActorDto[],
  ): Prisma.ActorUpdateWithWhereUniqueWithoutApplicationInput[] {
    return dtos.map((dto) => ({
      where: { id: dto.id },
      data: {
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.user && {
          user: {
            update: {
              ...(dto.user.email !== undefined && { email: dto.user.email }),
            },
          },
        }),
      },
    }));
  }

  private buildActorCreateList(
    dtos: UpdateActorDto[],
    applicationId: string,
  ): Prisma.ActorCreateWithoutApplicationInput[] {
    return dtos.map((dto) => {
      if (!dto.user || !dto.user.keycloakId) {
        throw new Error('Missing user.keycloakId for a new Actor');
      }

      return {
        role: dto.role,
        application: { connect: { id: applicationId } },
        user: {
          connect: { keycloakId: dto.user.keycloakId },
        },
      };
    });
  }
}
