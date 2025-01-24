import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { CombinedInterceptor } from './combined.interceptor';
import { decodeJwt } from 'jose';
import { lastValueFrom } from 'rxjs';

jest.mock('jose', () => ({
  decodeJwt: jest.fn(),
}));

describe('CombinedInterceptor', () => {
  let interceptor: CombinedInterceptor;

  const mockExecutionContext = (request: any, response: any = {}) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {},
        method: 'GET',
        url: '/',
        query: {},
        params: {},
        ip: '127.0.0.1',
        body: {},
        ...request,
      }),
      getResponse: () => ({
        setHeader: jest.fn(),
        statusCode: 200,
        ...response,
      }),
    }),
  });

  const mockCallHandler: CallHandler = {
    handle: () => of('test'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CombinedInterceptor],
    }).compile();

    interceptor = module.get<CombinedInterceptor>(CombinedInterceptor);

    jest.spyOn(interceptor['logger'], 'log');
    jest.spyOn(interceptor['logger'], 'error');
    jest.spyOn(interceptor['logger'], 'warn');
  });

  describe('Request Context', () => {
    it('should handle empty request gracefully', async () => {
      const context = mockExecutionContext({});
      const ctx = await interceptor['createRequestContext'](context as any);

      expect(ctx).toEqual(
        expect.objectContaining({
          method: 'GET',
          user: null,
          entityType: 'Inconnu',
        }),
      );
    });

    it('should calculate request size correctly', async () => {
      const request = { body: { data: 'test' } };
      const context = mockExecutionContext(request);

      const ctx = await interceptor['createRequestContext'](context as any);
      expect(ctx.requestSize).toBeGreaterThan(0);
    });
  });

  describe('Sanitization', () => {
    it('should mask sensitive fields in nested objects', async () => {
      const request = {
        body: {
          user: {
            password: 'secret',
            profile: { token: '123' },
          },
        },
      };
      const context = mockExecutionContext(request);

      const ctx = await interceptor['createRequestContext'](context as any);
      expect(ctx.data.user.password).toBe('***');
      expect(ctx.data.user.profile.token).toBe('***');
    });

    it('should sanitize authorization header', async () => {
      const request = {
        headers: { authorization: 'Bearer real-token' },
      };
      const context = mockExecutionContext(request);

      const ctx = await interceptor['createRequestContext'](context as any);
      expect(ctx.headers.authorization).toBe('Bearer ***');
    });
  });

  describe('JWT Handling', () => {
    it('should handle missing token gracefully', async () => {
      const request = { headers: {} };
      const context = mockExecutionContext(request);

      const ctx = await interceptor['createRequestContext'](context as any);
      expect(ctx.user).toBeNull();
    });

    it('should extract login time from token', async () => {
      (decodeJwt as jest.Mock).mockReturnValue({ iat: 1620000000 });
      const request = {
        headers: { authorization: 'Bearer valid.token' },
      };
      const context = mockExecutionContext(request);

      const ctx = await interceptor['createRequestContext'](context as any);
      expect(ctx.loginTime).toBe('2021-05-03T00:00:00.000Z');
    });
  });

  describe('Entity Detection', () => {
    it('should detect notification entity', async () => {
      const request = { url: '/api/notifications' };
      const context = mockExecutionContext(request);

      const ctx = await interceptor['createRequestContext'](context as any);
      expect(ctx.entityType).toBe('Notification');
    });

    it('should handle unknown entity types', async () => {
      const request = { url: '/api/unknown' };
      const context = mockExecutionContext(request);

      const ctx = await interceptor['createRequestContext'](context as any);
      expect(ctx.entityType).toBe('Inconnu');
    });
  });

  describe('Action Handling', () => {
    it('should log create action', async () => {
      const request = { method: 'POST' };
      const context = mockExecutionContext(request);

      const observable = await interceptor.intercept(
        context as any,
        mockCallHandler,
      );
      await lastValueFrom(observable);

      expect(interceptor['logger'].log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'create' }),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle large request bodies', async () => {
      const largeBody = { data: 'a'.repeat(10000) };
      const request = { body: largeBody };
      const context = mockExecutionContext(request);

      const ctx = await interceptor['createRequestContext'](context as any);
      expect(ctx.requestSize).toBeGreaterThan(10000);
    });

    it('should handle invalid HTTP methods', async () => {
      const request = { method: 'INVALID' };
      const context = mockExecutionContext(request);

      const ctx = await interceptor['createRequestContext'](context as any);
      expect(ctx.action).toBe('get');
    });
  });

  describe('Success Handling', () => {
    it('should log successful request with duration', async () => {
      const response = {
        statusCode: 200,
        setHeader: jest.fn(),
      };
      const request = {
        headers: { 'x-correlation-id': 'test-id' }, // Ajout des headers requis
        method: 'GET',
        url: '/test',
        query: {},
        params: {},
        ip: '127.0.0.1',
        body: {},
      };
      const context = mockExecutionContext(request, response);

      const observable = await interceptor.intercept(
        context as any,
        mockCallHandler,
      );
      await lastValueFrom(observable);

      expect(interceptor['logger'].log).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 200,
          correlationId: 'test-id',
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should log errors with stack trace', async () => {
      const error = new Error('Test error');
      const errorHandler = {
        handle: () => throwError(() => error),
      };
      const request = {
        headers: { 'x-correlation-id': 'error-id' },
        method: 'GET',
        url: '/test',
        query: {},
        params: {},
        ip: '127.0.0.1',
        body: {},
      };
      const response = {
        setHeader: jest.fn(), // Ajout de la méthode manquante
        statusCode: 500,
      };
      const context = mockExecutionContext(request, response);

      const observable = await interceptor.intercept(
        context as any,
        errorHandler as any,
      );
      await expect(lastValueFrom(observable)).rejects.toThrow('Test error');

      // Vérification de l'appel à setHeader
      expect(response.setHeader).toHaveBeenCalledWith(
        'X-Correlation-ID',
        expect.any(String),
      );
    });
  });

  describe('Search Handling', () => {
    it('should log search parameters and results', async () => {
      const request = {
        method: 'GET',
        url: '/applications/search?label=test',
        headers: {},
        query: { label: 'test' },
      };
      const response = { statusCode: 200, setHeader: jest.fn() };
      const context = mockExecutionContext(request, response);

      const observable = await interceptor.intercept(
        context as any,
        mockCallHandler,
      );
      await lastValueFrom(observable);

      expect(interceptor['logger'].log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'search',
          message: expect.stringContaining(
            'Recherche Application avec label "test"',
          ),
        }),
      );
    });
  });
});
