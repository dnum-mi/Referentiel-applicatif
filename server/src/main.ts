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

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3500',
      'http://localhost:8082',
      'http://localhost:8080',
      'https://api-referentiel-applications.apps.app1.numerique-interieur.com',
      'https://referentiel-applications.apps.app1.numerique-interieur.com',
      'http://integ-api-referentiel-applications.d284.dev.forge.minint.fr',
      'http://integ-referentiel-applications.d284.dev.forge.minint.fr',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Référentiel Applications')
    .setDescription('API pour la gestion des applications')
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: `Renseignez votre API Token pour accéder à l'API`,
      },
      'token',
    )
    .addSecurityRequirements('token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v2', app, document, {
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
