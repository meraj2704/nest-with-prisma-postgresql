import { Module } from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { Validator } from 'src/common/validation/validator.service';

@Module({
  controllers: [ModuleController],
  providers: [ModuleService, PrismaService, Validator],
})
export class ModuleModule {}
