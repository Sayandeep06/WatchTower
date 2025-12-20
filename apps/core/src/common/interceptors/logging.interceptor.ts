import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const correlationId = request.headers['x-correlation-id'];
    const now = Date.now();

    this.logger.log(
      `[${correlationId}] Incoming Request: ${method} ${url}`,
    );

    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`[${correlationId}] Request Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `[${correlationId}] Completed: ${method} ${url} - ${responseTime}ms`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `[${correlationId}] Failed: ${method} ${url} - ${responseTime}ms`,
            error.stack,
          );
        },
      }),
    );
  }
}
