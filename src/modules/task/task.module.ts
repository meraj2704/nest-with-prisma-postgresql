import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProgressService } from 'src/common/services/progress.service';
import { Validator } from 'src/common/validation/validator.service';

@Module({
  controllers: [TaskController],
  providers: [TaskService, PrismaService, ProgressService, Validator],
})
export class TaskModule {}
