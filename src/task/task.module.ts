import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProgressService } from 'src/common/services/progress.service';

@Module({
  controllers: [TaskController],
  providers: [TaskService, PrismaService, ProgressService],
})
export class TaskModule {}
