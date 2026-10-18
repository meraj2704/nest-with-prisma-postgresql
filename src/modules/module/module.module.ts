import { Module } from '@nestjs/common';
import { ModuleController } from './module.controller.js';
import { ModuleRepository } from './module.repository.js';
import { ModuleService } from './module.service.js';

@Module({
  controllers: [ModuleController],
  providers: [ModuleService, ModuleRepository],
  exports: [ModuleRepository],
})
export class ModuleModule {}
