import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

const ENVELOPE_KEYS = new Set(['message', 'data', 'meta']);

/**
 * Wraps every response as { success, statusCode, message, data, meta }.
 * Services may return a bare value, or an object with only { message?, data?, meta? }
 * to control the envelope.
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((body) => {
        if (body instanceof StreamableFile) {
          return body;
        }

        const isObject =
          body !== null && typeof body === 'object' && !Array.isArray(body);
        const isEnvelope =
          isObject &&
          Object.keys(body).length > 0 &&
          Object.keys(body).every((key) => ENVELOPE_KEYS.has(key));

        return {
          success: true,
          statusCode: context.switchToHttp().getResponse().statusCode,
          message:
            (isObject && typeof body.message === 'string' && body.message) ||
            'Request successful',
          data: isEnvelope ? (body.data ?? null) : (body ?? null),
          meta: isEnvelope ? body.meta : undefined,
        };
      }),
    );
  }
}
