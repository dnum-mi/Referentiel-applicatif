// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // Cette méthode générera un JWT pour un utilisateur donné
  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Exemple de validation, ici elle est basique
  async validateUser(username: string, pass: string): Promise<any> {
    // Ajoutez votre logique de validation ici
    return { userId: 1, username: 'john' }; // Exemple d'utilisateur valide
  }
}
