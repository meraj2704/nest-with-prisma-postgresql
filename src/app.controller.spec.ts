import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns the health payload', () => {
    expect(appController.getHello()).toMatchObject({
      status: 'ok',
      docs: '/api-docs',
      baseUrl: '/api/v1',
    });
  });
});
