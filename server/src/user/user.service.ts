import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { keycloakId },
    });
  }

  async findOrCreateByEmail(
    email: string,
    keycloakId: string,
  ): Promise<User | null> {
    return this.prisma.user.upsert({
      where: {
        email: email,
      },
      update: {},
      create: {
        email: email,
        keycloakId: keycloakId,
      },
    });
  }
}
