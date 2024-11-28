import { UnauthorizedException, Logger } from '@nestjs/common';
import * as jose from 'jose';
import { UserService } from '../user/user.service'

export class AuthUtils {
  constructor(private readonly userService: UserService) {}

  public getDecodedToken(req: any): any {
    console.log(req)
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    try {
      return jose.decodeJwt(token);
    } catch (error) {
      Logger.error('Erreur lors du décodage du JWT :', error);
    }
  }

  public async findOrCreateUser(decodedToken: any): Promise<any> {
    try {
      const user = await this.userService.findOrCreateByEmail(
        <string>decodedToken.email,
        <string>decodedToken.sub,
      );

      return user;
    } catch (error) {
      Logger.error('Erreur lors de la récupération/création de l\'utilisateur :', error);
      throw new UnauthorizedException('Échec lors de la gestion de l\'utilisateur');
    }
  }
} 