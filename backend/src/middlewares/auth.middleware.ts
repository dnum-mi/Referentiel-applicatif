import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '../utils/helpers';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const decodedToken = AuthUtils.getDecodedToken(req);
      const userFromDb = await AuthUtils.findOrCreateUser(
        decodedToken,
        this.userService,
      );

      const userExists = await this.prisma.user.findUnique({
        where: { id: userFromDb.id },
      });

      if (userExists) {
        req.user = userFromDb;
        next();
      } else {
        throw new UnauthorizedException("L'utilisateur n'existe pas");
      }
    } catch (error) {
      throw new UnauthorizedException("L'authentification a échoué");
    }
  }
}
