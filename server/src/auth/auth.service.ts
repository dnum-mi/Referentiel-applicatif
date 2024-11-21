import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

interface KeycloakUserInfoResponse {
    sub: string;
    email: string;
}

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

@Injectable()
export class AuthService {

    private readonly baseURL: string;
    private readonly realm: string;

    constructor() {
        const baseURL = process.env.KEYCLOAK_BASE_URL;
        const realm = process.env.KEYCLOAK_REALM;

        if (!baseURL) {
            throw new Error('KEYCLOAK_BASE_URL environment variable is not set');
        }
        if (!realm) {
            throw new Error('KEYCLOAK_REALM environment variable is not set');
        }

        this.baseURL = baseURL;
        this.realm = realm;
    }

    async authenticate(accessToken: string): Promise<User> {
        const url = `${this.baseURL}/realms/${this.realm}/protocol/openid-connect/userinfo`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new AuthenticationError(errorData.message || 'Erreur lors de l\'authentification avec Keycloak');
            }

            const data: KeycloakUserInfoResponse = await response.json();

            const { sub, email } = data;

            if (!sub || !email) {
                throw new AuthenticationError('Informations utilisateur invalides reçues de Keycloak');
            }

            const user: User = {
                KeycloakId: sub,
                email: email,
            };

            return user;
        } catch (e: unknown) {
            if (e instanceof Error) {
                throw new AuthenticationError(e.message);
            }
            throw new AuthenticationError('Une erreur inconnue est survenue lors de l\'authentification.');
        }
    }
}