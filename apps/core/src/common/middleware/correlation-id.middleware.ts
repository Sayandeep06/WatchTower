import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Get correlation ID from header or generate new one
    const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();

    // Set in request headers for downstream use
    req.headers['x-correlation-id'] = correlationId;

    // Set in response headers
    res.setHeader('X-Correlation-Id', correlationId);

    next();
  }
}
