import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res.message || exception.message;
      errorName = res.error || exception.name;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          let target = 'field';
          if (exception.meta?.target) {
            target = Array.isArray(exception.meta.target)
              ? exception.meta.target.join(', ')
              : (exception.meta.target as string);
          } else if (exception.meta?.constraint) {
            const constraint = exception.meta.constraint as string;
            if (constraint.includes('email')) target = 'email';
            if (constraint.includes('username')) target = 'username';
          }
          status = HttpStatus.CONFLICT;
          message = `This ${target} already exists. Please use a different one.`;
          errorName = 'ConflictError';
          break;
        }
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Related record not found. Please verify the provided IDs.';
          errorName = 'ReferenceError';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found in database.';
          errorName = 'NotFoundError';
          break;
        default:
          message = `Database error occurred (code: ${exception.code}).`;
          errorName = 'DatabaseError';
          break;
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      // Unknown fields or type mismatches caught at the ORM level
      status = HttpStatus.BAD_REQUEST;
      message =
        'Invalid data provided. Please check your request body and try again.';
      errorName = 'ValidationError';
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.name;
    }

    const flatMessage = Array.isArray(message) ? message.join(', ') : message;

    const logLine = `[${request.method}] ${request.url} → ${status} ${errorName}: ${flatMessage}`;
    if (status >= 500) {
      this.logger.error(logLine);
      if (exception instanceof Error) this.logger.error(exception.stack);
    } else {
      this.logger.warn(logLine);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      error: errorName,
      message:
        process.env.NODE_ENV === 'production' &&
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'An unexpected error occurred'
          : flatMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
