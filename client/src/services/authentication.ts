import Keycloak from 'keycloak-js';

export const authentication = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_AUTH_SERVER_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});
