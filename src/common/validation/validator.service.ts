// src/common/validation/project-validator.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class Validator {
  constructor(private readonly prisma: PrismaService) {}

  async validateProjectExists(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
    return project;
  }

  async validateModuleExists(moduleId: number) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }
    return module;
  }

  async validateModuleInProject(moduleId: number, projectId: number) {
    const module = await this.validateModuleExists(moduleId);
    if (module.projectId !== projectId) {
      throw new NotFoundException(`Module does not belong to project`);
    }
    return module;
  }
  async validateTaskExists(taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return task;
  }

  validateTaskInProgress(task: any) {
    if (task.status !== 'IN_PROGRESS') {
      throw new PreconditionFailedException('Task is not in progress');
    }
  }

  validateTaskNotCompleted(task: any) {
    if (task.completed) {
      throw new ConflictException('Task is already completed');
    }
  }

  validateProgress(progress: number) {
    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }
  }
}
