import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.KEYCLOAK_CLIENT_SECRET,
    });
  }

  async validate(payload: any) {
    this.logger.debug(`Payload JWT reçu: ${JSON.stringify(payload)}`);
    return { userId: payload.sub, username: payload.username };
  }
}
