// src/main.ts
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  const logger = new Logger('Bootstrap');
  app.setGlobalPrefix('api/v2');

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    preflightContinue: false
  });

  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Référentiel Applications')
    .setDescription('API pour la gestion des applications')
    .setVersion('2.0')
    .addOAuth2(
      {
        type: 'oauth2',
        description: 'OAuth2 authentication using Keycloak',
        flows: {
          authorizationCode: {
            authorizationUrl: `${process.env.KEYCLOAK_BASE_URL}/realms/referentiel-applications/protocol/openid-connect/auth`,
            tokenUrl: `${process.env.KEYCLOAK_BASE_URL}/realms/referentiel-applications/protocol/openid-connect/token`,
            scopes: {
              openid: 'OpenID scope',
              profile: 'Profile scope',
            },
          },
        },
      },
      'oauth2',
    )
    .addSecurityRequirements('oauth2')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v2/', app, document, {
    explorer: true,
    jsonDocumentUrl: 'swagger/json',
    //customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(3500);
  logger.log(`Application en cours d'exécution`);
}
bootstrap();
