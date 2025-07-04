// common/interceptors/response.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = new Date().toISOString();

    return next.handle().pipe(
      map((data: any) => {
        // Handle paginated responses (if data has meta property)
        if (data?.meta) {
          return {
            success: true,
            message: data.message,
            data: data.data || data.items || data.result,
            timestamp: now,
            meta: data.meta,
          };
        }

        // Handle normal responses
        return {
          success: true,
          message: data?.message,
          data: data?.data || data,
          timestamp: now,
          meta: data?.meta,
        };
      }),
    );
  }
}
