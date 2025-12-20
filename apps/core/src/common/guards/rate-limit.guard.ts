import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly requests = new Map<string, number[]>();
  private readonly windowMs = 60000; // 1 minute
  private readonly maxRequests = 100; // Max requests per window

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const key = `${ip}:${request.url}`;

    const now = Date.now();
    const requestTimestamps = this.requests.get(key) || [];

    // Remove old timestamps outside the window
    const validTimestamps = requestTimestamps.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    if (validTimestamps.length >= this.maxRequests) {
      this.logger.warn(`Rate limit exceeded for ${ip}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return true;
  }
}
