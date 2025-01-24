import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationService } from '../application/application.service';
import { decodeJwt } from 'jose';

type LogAction = 'create' | 'update' | 'delete' | 'get' | 'search' | 'error';

interface RequestContext {
  method: string;
  url: string;
  headers: Record<string, any>;
  query: Record<string, any>;
  params: Record<string, any>;
  ip: string;
  data: any;
  correlationId: string;
  user: any;
  userAgent: string;
  entityType: string;
  loginTime?: string;
  referer: string;
  requestSize: number;
  statusCode?: number;
  label?: string;
  applicationCache: Map<string, any>;
  startTime: number;
  action: LogAction;
}

@Injectable()
export class CombinedInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CombinedInterceptor.name);

  constructor() {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ctx = await this.createRequestContext(context);
    const response = context.switchToHttp().getResponse();

    response.setHeader('X-Correlation-ID', ctx.correlationId);
    this.logStart(ctx);

    if (ctx.action === 'search') {
      this.logSearchAction(ctx);
    }

    return next.handle().pipe(
      tap({
        next: (result) => this.handleSuccess(result, ctx, response),
        error: (err) => this.handleError(err, ctx),
      }),
    );
  }

  private async createRequestContext(
    context: ExecutionContext,
  ): Promise<RequestContext> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers, query, params, ip, body } = request;
    const correlationId = headers['x-correlation-id'] || uuidv4();

    return {
      method: method.toUpperCase(),
      url: url.toLowerCase(),
      headers: this.sanitizeHeaders(headers),
      query: this.sanitizeData(query),
      params,
      ip,
      data: this.sanitizeData(body),
      correlationId,
      user: this.extractUserFromToken(headers, correlationId),
      userAgent: headers['user-agent'] || 'Inconnu',
      entityType: this.getEntityType(url),
      loginTime: this.getLoginTime(headers, correlationId),
      referer: headers['referer'] || headers['referrer'] || 'Inconnu',
      requestSize: this.getRequestSize(body),
      applicationCache: new Map<string, any>(),
      startTime: Date.now(),
      action: this.determineInitialAction(url, method),
    };
  }

  private determineInitialAction(url: string, method: string): LogAction {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('/applications/search?label=')) {
      return 'search';
    }

    switch (method.toUpperCase()) {
      case 'POST':
        return 'create';
      case 'PUT':
      case 'PATCH':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        return 'get';
    }
  }

  private logSearchAction(ctx: RequestContext) {
    const searchLabel = ctx.query.label?.trim() || 'inconnu';

    this.logger.log({
      ...ctx,
      action: 'search',
      message: `[${ctx.correlationId}] Recherche ${ctx.entityType} avec label "${searchLabel}"`,
      extra: {
        searchCriteria: {
          label: searchLabel,
          ...this.sanitizeData(ctx.query),
        },
      },
    });
  }

  private handleSuccess(result: any, ctx: RequestContext, response: any) {
    const duration = Date.now() - ctx.startTime;
    ctx.statusCode = response.statusCode;

    const action = this.determineAction(ctx);
    const message = this.buildLogMessage(action, ctx);

    this.logAction(ctx, {
      action,
      message,
      durationMs: duration,
      data: this.getLogData(action, result),
    });

    if (action === 'search') {
      this.logSearchDetails(ctx, result);
    }
  }

  private determineAction(ctx: RequestContext): LogAction {
    if (ctx.url.includes('/application/search')) return 'search';

    switch (ctx.method) {
      case 'POST':
        return 'create';
      case 'PUT':
      case 'PATCH':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        return 'get';
    }
  }

  private buildLogMessage(action: LogAction, ctx: RequestContext): string {
    const messages = {
      create: `Création ${ctx.entityType} "${ctx.label}"`,
      update: `Mise à jour ${ctx.entityType} "${ctx.label}"`,
      delete: `Suppression ${ctx.entityType} "${ctx.label}"`,
      get: `Récupération ${ctx.entityType}`,
      search: `Recherche ${ctx.entityType} avec "${ctx.query.label}"`,
      error: "Erreur lors de l'opération",
    };

    return messages[action] || 'Action inconnue';
  }

  private getLogData(action: LogAction, result: any): any {
    const shouldLogData = ['create', 'update', 'search'].includes(action);
    return shouldLogData ? this.sanitizeData(result) : undefined;
  }

  private logSearchDetails(ctx: RequestContext, result: any) {
    this.logAction(ctx, {
      action: 'search',
      message: `Résultats de recherche (${result?.length} éléments)`,
      data: this.sanitizeData(result),
    });
  }

  private logStart(ctx: RequestContext) {
    this.logAction(ctx, {
      action: 'get',
      message: `Début traitement requête ${ctx.method} ${ctx.url}`,
    });
  }

  private logAction(
    ctx: RequestContext,
    options: {
      action: LogAction;
      message: string;
      durationMs?: number;
      data?: any;
    },
  ) {
    const fullMessage = `[${ctx.correlationId}] ${options.message}`;
    const logEntry = {
      ...ctx,
      ...options,
      message: fullMessage,
      data: options.data,
    };

    this.logger.log(logEntry);
  }

  private handleError(error: Error, ctx: RequestContext) {
    this.logAction(ctx, {
      action: 'error',
      message: `Échec de la requête : ${error.message}`,
      data: { stack: error.stack },
    });
  }

  private sanitizeData(data: any): any {
    const sensitiveKeys = ['password', 'token', 'authorization'];

    const sanitize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;

      return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        acc[key] = sensitiveKeys.includes(key.toLowerCase())
          ? '***'
          : typeof value === 'object'
            ? sanitize(value)
            : value;
        return acc;
      }, {});
    };

    return sanitize(data);
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };
    if (sanitized.authorization) sanitized.authorization = 'Bearer ***';
    return sanitized;
  }

  private extractUserFromToken(headers: any, correlationId: string): any {
    try {
      const token = headers.authorization?.split(' ')[1];
      if (!token) return null;

      const decoded = decodeJwt(token);
      return decoded?.sub || null;
    } catch (error) {
      this.logger.error(`[${correlationId}] Erreur décodage token: ${error}`);
      return null;
    }
  }

  private getLoginTime(
    headers: any,
    correlationId: string,
  ): string | undefined {
    try {
      const token = headers.authorization?.split(' ')[1];
      if (!token) return undefined;

      const decoded = decodeJwt(token);
      return decoded?.iat
        ? new Date(decoded.iat * 1000).toISOString()
        : undefined;
    } catch (error) {
      this.logger.warn(
        `[${correlationId}] Impossible de récupérer le login time`,
      );
      return undefined;
    }
  }

  private getEntityType(url: string): string {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('notification')) return 'Notification';
    if (lowerUrl.includes('application')) return 'Application';
    return 'Inconnu';
  }

  private getRequestSize(body: any): number {
    try {
      return body ? Buffer.byteLength(JSON.stringify(body)) : 0;
    } catch (error) {
      this.logger.warn('Erreur calcul taille requête', error);
      return 0;
    }
  }
}
