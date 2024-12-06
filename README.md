# Référentiel des applications

## Introduction

L'application "Référentiel des applications" est de cataloguer et gérer les informations sur les applications utilisées au sein du ministère de l'intérieur

### Objectif

Fournir un point de vérité pour répertorier, catégoriser et gérer les métadonnées des applications.

## Technologies Utilisées

- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/)

## Installation

### Prérequis

Liste des outils utilisés par le projet à installer :

- [Docker](https://docs.docker.com/get-started/get-docker/)

### How to run ?

1. Run the stack

```bash
docker compose up -d
```

2. Run migrations (in the backend container)

```bash
npx prisma migrate deploy
```

### How to stop ?

```bash
docker compose down
```

### More

See [docker-compose.yml](docker-compose.yml) for services definitions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
