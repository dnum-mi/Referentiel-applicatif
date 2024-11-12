FROM quay.io/keycloak/keycloak

COPY ./realm-export.json /opt/keycloak/data/import/realm-export.json

CMD ["start-dev", "--import-realm"]