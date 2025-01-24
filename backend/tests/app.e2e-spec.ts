import request from 'supertest';
import { setupTestSuite } from './setup';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  const getApp = setupTestSuite();
  const id = uuidv4();
  const keycloakId = uuidv4();

  beforeAll(async () => {
    const prismaService = new PrismaService();
    await prismaService.user.create({
      data: {
        email: `${id}@test.fr`,
        id: id,
        keycloakId: keycloakId,
      },
    });
  });

  it('/ (GET)', () => {
    const app = getApp();
    return request(app.getHttpServer())
      .get('/')
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIwYXBzYjYxQzVFa2x6d2JjRUpXYXZPeXllMk5UQ29FRHpRb2lFdWFlTjJnIn0.eyJzdWIiOiI5OWZhNDE5ZS1mNGZiLTRlZDctOGIxMS1jNzIxMGIzMDkiLCAiZW1haWwiOiJ0aG9tYXMuYmVybmFyZC1lY29ub2NvbUBpbnRlcmlldXIuZ291di5mciJ9.',
      )
      .expect(200)
      .expect('Hello World!');
  });
});
