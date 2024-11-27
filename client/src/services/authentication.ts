import Keycloak from 'keycloak-js';

export const authentication = new Keycloak({
  url: import.meta.env.VITE_RDA_KEYCLOAK_AUTH_SERVER_URL ?? "VITE_RDA_KEYCLOAK_AUTH_SERVER_URL",
  realm: import.meta.env.VITE_RDA_KEYCLOAK_REALM ?? "VITE_RDA_KEYCLOAK_REALM",
  clientId: import.meta.env.VITE_RDA_KEYCLOAK_CLIENT_ID ?? "VITE_RDA_KEYCLOAK_CLIENT_ID",
});
