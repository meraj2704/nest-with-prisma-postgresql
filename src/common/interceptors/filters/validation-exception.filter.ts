// src/common/filters/validation-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse();

    let errors = [];
    if (typeof exceptionResponse === 'object' && exceptionResponse['message']) {
      errors = Array.isArray(exceptionResponse['message'])
        ? exceptionResponse['message']
        : [exceptionResponse['message']];
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
