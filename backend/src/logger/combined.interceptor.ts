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

@Injectable()
export class CombinedInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CombinedInterceptor.name);

  constructor(private readonly applicationService: ApplicationService) {}

  private logObjectParams: Partial<LogObjectParams>;

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, headers, query, params, ip, body } = request;
    const correlationId = headers['x-correlation-id'] || uuidv4();
    const { user, loginTime } = this.extractUserFromToken(
      headers,
      correlationId,
    );
    const entityType = this.getEntityType(url);
    const userAgent = headers['user-agent'] || 'Inconnu';
    const referer = headers['referer'] || headers['referrer'] || 'Inconnu';
    const sanitizedHeaders = this.sanitizeHeaders(headers);
    const requestSize = this.getRequestSize(body);

    response.setHeader('X-Correlation-ID', correlationId);

    this.logObjectParams = {
      method,
      url,
      headers: sanitizedHeaders,
      query,
      params,
      ip,
      data: body,
      correlationId,
      user,
      userAgent,
      entityType,
      loginTime,
      referer,
      requestSize,
    };

    if (entityType === 'Application' || entityType === 'Notification') {
      try {
        let applicationId: string | undefined;

        if (entityType === 'Application') {
          applicationId = params.id;
        } else if (entityType === 'Notification') {
          applicationId = params.applicationId || body.applicationId;
        }

        if (applicationId) {
          const application = await this.getApplicationById(applicationId);
          const label = this.getLabel(application);
          this.logObjectParams.label = label;
          this.logger.log(
            `[${correlationId}] Traitement de l'entité ${entityType}: "${label}"`,
          );
          this.logAction({
            label,
          });
        } else {
          this.logger.warn(
            `[${correlationId}] applicationId non trouvé pour l'entité ${entityType}.`,
          );
        }
      } catch (error) {
        this.logger.error(
          `[${correlationId}] Erreur lors de la récupération de l'application pour ${entityType}: ${error}`,
        );
      }
    }

    if (method === 'POST') {
      this.logAction({
        message: `Début création de ${entityType}`,
        action: 'create',
      });
    }

    if (method === 'PATCH' || method === 'PUT') {
      const oldData = await this.getOldData(params.id);
      this.logAction({
        message: `Début mise à jour de ${entityType} ${params.id}`,
        action: 'update',
        extra: { oldData },
      });
    }

    return next.handle().pipe(
      tap((result) => {
        const duration = Date.now() - start;
        const statusCode = response.statusCode;
        this.logObjectParams.statusCode = statusCode;
        this.logAction({
          message: `[${correlationId}] Réponse envoyée`,
          method,
          url,
          durationMs: duration,
          correlationId,
          statusCode,
        });

        if (entityType === 'Application' || entityType === 'Notification') {
          if (method === 'POST') {
            this.logAction({
              message: `Création terminée de ${this.logObjectParams.entityType} "${this.logObjectParams.label}"`,
              action: 'create',
              data: result,
            });
          }

          if (method === 'PATCH' || method === 'PUT') {
            const oldData = this.getOldData(params.id);
            const modifiedFields = this.getModifiedFields(oldData, body);
            this.logAction({
              message: `Mise à jour terminée pour ${this.logObjectParams.entityType} "${this.logObjectParams.label}"`,
              extra: {
                modifiedFields,
              },
            });
          }
        }
      }),
    );
  }

  private getLabel(application): string {
    if (
      this.logObjectParams.entityType === 'Application' ||
      this.logObjectParams.entityType === 'Notification'
    ) {
      return application?.label || this.logObjectParams.params.id;
    }

    return '';
  }

  private async getOldData(id: string) {
    if (this.logObjectParams.entityType !== 'Application') return;

    try {
      return await this.getApplicationById(id);
    } catch (error) {
      this.logger.error(
        `[${this.logObjectParams.correlationId}] Erreur lors de la récupération de l'ancienne version de l'application ${id}`,
        error,
      );
      return;
    }
  }

  private getModifiedFields(
    oldData: any,
    newData: any,
  ): Record<string, { before: any; after: any }> {
    const modifiedFields: Record<string, { before: any; after: any }> = {};

    if (!oldData || !newData) return modifiedFields;

    for (const key of Object.keys(newData)) {
      if (oldData[key] !== newData[key]) {
        modifiedFields[key] = { before: oldData[key], after: newData[key] };
      }
    }

    return modifiedFields;
  }

  private async getApplicationById(id: string) {
    return await this.applicationService.getApplicationById(id);
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitizedHeaders = { ...headers };
    if (sanitizedHeaders.authorization) {
      sanitizedHeaders.authorization = 'Bearer ***';
    }
    return sanitizedHeaders;
  }

  private extractUserFromToken(
    headers: any,
    correlationId: string,
  ): { user: any; loginTime?: string } {
    if (headers.authorization && headers.authorization.startsWith('Bearer ')) {
      const token = headers.authorization.split(' ')[1];
      try {
        const decodedToken = decodeJwt(token);
        if (decodedToken && decodedToken.sub) {
          const loginTime = decodedToken.iat
            ? new Date(decodedToken.iat * 1000).toISOString()
            : undefined;
          return {
            user: decodedToken.sub,
            loginTime,
          };
        }
        this.logger.error(
          `[${correlationId}] La claim "sub" est absente du token décodé.`,
        );
      } catch (error) {
        this.logger.error(
          `[${correlationId}] Erreur lors du décodage du token: ${error}`,
        );
      }
    }
    return { user: null };
  }

  private getEntityType(url: string): string {
    if (url.includes('notifications')) {
      return 'Notification';
    } else if (url.includes('applications')) {
      return 'Application';
    }
    return 'Inconnu';
  }

  private getRequestSize(body: any): number {
    if (!body) return 0;
    try {
      return Buffer.byteLength(JSON.stringify(body));
    } catch (error) {
      this.logger.warn('Impossible de calculer la taille de la requête', error);
      return 0;
    }
  }

  private logAction(extra?: any): void {
    this.logger.log({
      ...this.logObjectParams,
      ...extra,
      message: extra.message
        ? `[${this.logObjectParams.correlationId}] ${extra.message}`
        : '',
    });
  }
}

type LogObjectParams = {
  correlationId: string;
  method: string;
  url: string;
  query: any;
  params: any;
  ip: string;
  headers: any;
  user: any;
  userAgent: string;
  label?: string;
  extra?: any;
  data?: any;
  entityType: string;
  action?: string;
  message?: string;
  loginTime?: string;
  statusCode?: number;
  responseBody?: any;
  referer?: string;
  requestSize?: number;
};
