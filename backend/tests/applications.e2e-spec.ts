import request from 'supertest';
import { setupTestSuite } from './setup';

describe('Applications', () => {
  const getApp = setupTestSuite();

  it(`/GET applications`, () => {
    const app = getApp();
    return request(app.getHttpServer()).get('/applications').expect(200);
  });

  it(`/GET applications/search`, () => {
    const app = getApp();
    return request(app.getHttpServer()).get('/applications/search').expect(200);
  });
});
