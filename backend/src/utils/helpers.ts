import * as jose from 'jose';
import { UserService } from '../user/user.service';

export class AuthUtils {
  static getDecodedToken(req: any): any {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    try {
      return jose.decodeJwt(token);
    } catch (error) {}
  }

  static async findOrCreateUser(
    decodedToken: any,
    userService: UserService,
  ): Promise<any> {
    try {
      const user = await userService.findOrCreateUserByEmail(
        decodedToken.email as string,
        decodedToken.sub as string,
      );
      return user;
    } catch (error) {}
  }
}
