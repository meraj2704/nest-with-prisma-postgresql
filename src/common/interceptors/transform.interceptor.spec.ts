import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor.js';

describe('TransformInterceptor', () => {
  const interceptor = new TransformInterceptor();
  const context = {
    switchToHttp: () => ({ getResponse: () => ({ statusCode: 200 }) }),
  } as unknown as ExecutionContext;

  const run = (body: unknown) =>
    lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of(body),
      } as CallHandler),
    );

  it('unwraps { message, data } returned by services', async () => {
    await expect(run({ message: 'Done', data: { id: 1 } })).resolves.toEqual({
      success: true,
      statusCode: 200,
      message: 'Done',
      data: { id: 1 },
      meta: undefined,
    });
  });

  it('passes meta through for paginated results', async () => {
    const result = await run({ data: [1, 2], meta: { total: 2 } });
    expect(result).toMatchObject({ data: [1, 2], meta: { total: 2 } });
  });

  it('wraps a bare value with a default message', async () => {
    await expect(run([1, 2])).resolves.toMatchObject({
      message: 'Request successful',
      data: [1, 2],
    });
  });

  it('keeps a plain object that merely has a message field as data', async () => {
    const health = { status: 'ok', message: 'up' };
    await expect(run(health)).resolves.toMatchObject({
      message: 'up',
      data: health,
    });
  });

  it('returns null data when a service only sends a message', async () => {
    await expect(run({ message: 'Password changed' })).resolves.toMatchObject({
      message: 'Password changed',
      data: null,
    });
  });
});
