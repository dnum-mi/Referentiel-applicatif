import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret', // Clé secrète pour signer les tokens
      signOptions: { expiresIn: '1h' }, // Durée de vie des tokens
    }),
  ],
  providers: [AuthService, JwtStrategy], // Enregistrement de JwtStrategy et AuthService
  controllers: [AuthController],
  exports: [JwtModule], // Exportez JwtModule pour l'utiliser ailleurs
})
export class AuthModule {}
