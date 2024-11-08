import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.KEYCLOAK_CLIENT_SECRET, // Remplacez par votre clé secrète
    });
  }

  async validate(payload: any) {
    Logger.log(payload)
    return { userId: payload.sub, username: payload.username };
  }
}
