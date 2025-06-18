import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { Validator } from 'src/common/validation/validator.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService, Validator],
})
export class ProjectModule {}
