import { Global, Module } from '@nestjs/common';
import { ProgressService } from './services/progress.service.js';
import { Validator } from './validation/validator.service.js';

/** Cross-module helpers that every feature module can inject without importing. */
@Global()
@Module({
  providers: [Validator, ProgressService],
  exports: [Validator, ProgressService],
})
export class CommonModule {}
