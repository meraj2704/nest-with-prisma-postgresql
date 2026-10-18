import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

type Client = Prisma.TransactionClient | PrismaService;

/** Rolls task progress up to its module, and module progress up to its project. */
@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  // Pass the transaction client when called inside $transaction
  async updateModuleProgress(moduleId: number, client: Client = this.prisma) {
    const tasks = await client.task.findMany({
      where: { moduleId },
      select: { progress: true },
    });

    if (tasks.length === 0) return 0;

    const totalProgress = tasks.reduce(
      (sum, task) => sum + (task.progress || 0),
      0,
    );
    const avgProgress = totalProgress / tasks.length;

    await client.module.update({
      where: { id: moduleId },
      data: { progress: avgProgress, completed: avgProgress === 100 },
    });

    return avgProgress;
  }

  async updateProjectProgress(projectId: number, client: Client = this.prisma) {
    const modules = await client.module.findMany({
      where: { projectId },
      select: { progress: true },
    });

    if (modules.length === 0) return 0;

    const totalProgress = modules.reduce(
      (sum, module) => sum + (module.progress || 0),
      0,
    );
    const avgProgress = totalProgress / modules.length;

    await client.project.update({
      where: { id: projectId },
      data: { progress: avgProgress, completed: avgProgress === 100 },
    });

    return avgProgress;
  }
}
