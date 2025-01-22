import request from 'supertest';
import { setupTestSuite } from './setup';

describe('AppController (e2e)', () => {
  const getApp = setupTestSuite();

  it('/ (GET)', () => {
    const app = getApp();
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
