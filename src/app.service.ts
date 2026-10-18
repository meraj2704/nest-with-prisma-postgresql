import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'ok',
      message: 'Team Task Management API is up and running',
      docs: '/api-docs',
      baseUrl: '/api/v1',
      timestamp: new Date().toISOString(),
    };
  }
}
