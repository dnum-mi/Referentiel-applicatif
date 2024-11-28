import { UnauthorizedException, Logger } from '@nestjs/common';
import * as jose from 'jose';
import { UserService } from '../user/user.service'

export class AuthUtils {
  constructor(private readonly userService: UserService) {}

  public getDecodedToken(req: any): any {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('En-tête Authorization manquant');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token Bearer non fourni');
    }

    try {
      return jose.decodeJwt(token);
    } catch (error) {
      Logger.error('Erreur lors du décodage du JWT :', error);
      throw new UnauthorizedException('JWT invalide ou malformé');
    }
  }

  public async findOrCreateUser(decodedToken: any): Promise<any> {
    if (!decodedToken.email || !decodedToken.sub) {
      throw new UnauthorizedException('JWT manquant de claims requis (email ou sub)');
    }

    try {
      const user = await this.userService.findOrCreateByEmail(
        <string>decodedToken.email,
        <string>decodedToken.sub,
      );

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      return user;
    } catch (error) {
      Logger.error('Erreur lors de la récupération/création de l\'utilisateur :', error);
      throw new UnauthorizedException('Échec lors de la gestion de l\'utilisateur');
    }
  }
}