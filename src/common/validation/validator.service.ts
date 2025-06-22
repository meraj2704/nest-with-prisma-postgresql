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

  async validateProjectExistWitName(name: string) {
    const project = await this.prisma.project.findUnique({
      where: { name },
    });

    if (project) {
      throw new ConflictException(`Project with name ${name} already exists`);
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

  async validateModuleAlsoUser(moduleId: number, userId: number) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        projectId: true,
        assignedDevelopers: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!module) {
      throw new NotFoundException(`Module not found with ${moduleId}`);
    }
    if (module.assignedDevelopers.length === 0) {
      throw new NotFoundException(`User not found in this module.`);
    }
    const userExist = module.assignedDevelopers.find(
      (dev) => dev.id === userId,
    );
    if (!userExist) {
      throw new NotFoundException(`This user not exist in this module`);
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

  async validateUserExist(userId: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`The following user were not found}`);
    }
  }

  async validateUsersExist(userIds: number[]) {
    if (!userIds?.length) return true;

    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });

    const existingIds = existingUsers.map((user) => user.id);
    const missingIds = userIds.filter((id) => !existingIds.includes(id));

    if (missingIds?.length > 0) {
      throw new NotFoundException(
        `The following user IDs were not found: ${missingIds.join(', ')}`,
      );
    }
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
