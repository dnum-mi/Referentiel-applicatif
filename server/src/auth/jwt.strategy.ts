import { Logger } from '@nestjs/common';
// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'http://localhost:8082/realms/referentiel-applications/protocol/openid-connect/certs',
      }),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    console.log('Payload JWT reçu :', payload);
    // Retournez les informations utilisateur nécessaires
    return { userId: payload.sub, username: payload.preferred_username };
  }
}