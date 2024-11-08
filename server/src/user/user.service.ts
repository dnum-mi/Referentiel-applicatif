import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { User } from '@prisma/client';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(keycloakId: string, email: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        keycloakId,
        email,
      },
    });
  }
  
  async findUserByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { keycloakId },
    });
  }
 }

