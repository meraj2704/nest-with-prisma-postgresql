// progress.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../src/prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async updateModuleProgress(moduleId: number) {
    const tasks = await this.prisma.task.findMany({
      where: { moduleId },
      select: { progress: true },
    });

    if (tasks.length === 0) return 0;

    const totalProgress = tasks.reduce(
      (sum, task) => sum + (task.progress || 0),
      0,
    );
    const avgProgress = totalProgress / tasks.length;

    await this.prisma.module.update({
      where: { id: moduleId },
      data: { progress: avgProgress, completed: avgProgress === 100 },
    });

    return avgProgress;
  }

  async updateProjectProgress(projectId: number) {
    // Get all modules in the project
    const modules = await this.prisma.module.findMany({
      where: { projectId },
      select: { progress: true },
    });

    if (modules.length === 0) return 0;

    // Calculate average progress
    const totalProgress = modules.reduce(
      (sum, module) => sum + (module.progress || 0),
      0,
    );
    const avgProgress = totalProgress / modules.length;

    // Update project progress
    await this.prisma.project.update({
      where: { id: projectId },
      data: { progress: avgProgress, completed: avgProgress === 100 },
    });

    return avgProgress;
  }
}
