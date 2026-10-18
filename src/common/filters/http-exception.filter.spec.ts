import { jest } from '@jest/globals';
import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AllExceptionsFilter } from './http-exception.filter.js';

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();
  let json: jest.Mock;
  let status: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn(() => ({ json }));
    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ method: 'GET', url: '/api/v1/x' }),
      }),
    } as unknown as ArgumentsHost;
    jest.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);
    jest.spyOn(filter['logger'], 'warn').mockImplementation(() => undefined);
  });

  const prismaError = (code: string, meta?: Record<string, unknown>) =>
    new Prisma.PrismaClientKnownRequestError('db error', {
      code,
      clientVersion: 'test',
      meta,
    });

  it('keeps the status and message of HttpExceptions', () => {
    filter.catch(new NotFoundException('Task with ID 9 not found'), host);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 404,
        message: 'Task with ID 9 not found',
      }),
    );
  });

  it.each([
    ['P2002', 409, { target: ['email'] }],
    ['P2003', 400, undefined],
    ['P2025', 404, undefined],
  ])('maps Prisma %s to HTTP %i', (code, expected, meta) => {
    filter.catch(prismaError(code, meta), host);
    expect(status).toHaveBeenCalledWith(expected);
  });

  it('names the conflicting field for unique violations', () => {
    filter.catch(prismaError('P2002', { target: ['email'] }), host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'This email already exists. Please use a different one.',
      }),
    );
  });

  it('returns 500 for unknown errors', () => {
    filter.catch(new Error('boom'), host);
    expect(status).toHaveBeenCalledWith(500);
  });
});
