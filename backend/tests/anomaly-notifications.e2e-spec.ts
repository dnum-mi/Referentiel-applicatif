import request from 'supertest';
import { setupTestSuite } from './setup';

describe('Anomaly Notifications', () => {
  const getApp = setupTestSuite();

  it(`/GET anomaly-notifications`, () => {
    const app = getApp();
    return request(app.getHttpServer())
      .get('/anomaly-notifications')
      .expect(200);
  });
});
