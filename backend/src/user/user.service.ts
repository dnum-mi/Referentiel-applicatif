import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { keycloakId },
    });
  }

  async findOrCreateUserByEmail(
    email: string,
    keycloakId?: string,
  ): Promise<User> {
    return this.prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        keycloakId: keycloakId ?? null,
      },
    });
  }
}
