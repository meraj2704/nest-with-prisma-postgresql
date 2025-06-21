import { EndTaskDto } from './dto/end-task.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProgressService } from 'src/common/services/progress.service';

import { Validator } from 'src/common/validation/validator.service';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private progressService: ProgressService,
    private validator: Validator,
  ) {}
  async create(createTaskDto: CreateTaskDto) {
    const module = await this.validator.validateModuleAlsoUser(
      createTaskDto.moduleId,
      createTaskDto.assignedUser,
    );

    const {
      title,
      description,
      type,
      priority,
      dueDate,
      estimatedHours,
      moduleId,
      assignedUser,
    } = createTaskDto;

    const task = await this.prisma.task.create({
      data: {
        title,
        description,
        type,
        priority,
        dueDate,
        estimatedHours,
        module: { connect: { id: moduleId } },
        project: { connect: { id: module.projectId } },
        assignedUser: { connect: { id: assignedUser } },
      },
    });
    await this.progressService.updateModuleProgress(createTaskDto.moduleId);

    await this.progressService.updateProjectProgress(module.projectId);
    return {
      message: 'Task successfully created',
      data: task,
    };
  }

  async findAll() {
    const tasks = await this.prisma.task.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        priority: true,
        dueDate: true,
        progress: true,
        totalWorkHours: true,
        estimatedHours: true,
        completed: true,
        status: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        module: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUser: true,
      },
    });
    return {
      message: 'Tasks successfully retrieved',
      data: tasks,
    };
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return {
      message: 'Task successfully retrieved',
      data: task,
    };
  }

  async findByProjectId(id: number) {
    await this.validator.validateProjectExists(id);
    const tasks = await this.prisma.task.findMany({
      where: { projectId: id },
    });
    return {
      message: `Successfully fetch all task by project id ${id}`,
      data: tasks,
    };
  }

  async findByModuleId(id: number) {
    await this.validator.validateModuleExists(id);
    const tasks = await this.prisma.task.findMany({
      where: { moduleId: id },
    });
    return {
      message: `Successfully fetch all task by module id ${id}`,
      data: tasks,
    };
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return {
      message: 'Task successfully updated',
      data: task,
    };
  }

  async remove(id: number) {
    const task = await this.prisma.task.delete({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return {
      message: 'Task successfully removed',
    };
  }

  async startTask(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    if (task.status === 'IN_PROGRESS') {
      throw new PreconditionFailedException('Task is already in progress');
    }
    if (task.status === 'DONE') {
      throw new ConflictException('Task is already completed');
    }
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
    return {
      message: 'Task successfully started',
      data: updatedTask,
    };
  }

  async endTask(id: number, endTaskDto: EndTaskDto) {
    return await this.prisma.$transaction(async (prisma) => {
      const { progress, summary } = endTaskDto;
      const task = await prisma.task.findUnique({
        where: { id },
      });
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      if (task.status !== 'IN_PROGRESS') {
        throw new PreconditionFailedException('Task is not in progress');
      }
      if (task.completed) {
        throw new ConflictException('Task is already completed');
      }
      if (progress < 0 || progress > 100) {
        throw new BadRequestException('Progress must be between 0 and 100');
      }
      const now = new Date();
      const durationMinutes = Math.floor(
        (now.getTime() - task.startedAt.getTime()) / (1000 * 60),
      );

      const workSession = await prisma.workSession.create({
        data: {
          start: task.startedAt,
          end: now,
          durationMinutes,
          summary,
          progress,
          taskId: id,
          projectId: task.projectId,
          moduleId: task.moduleId,
          userId: 1,
        },
      });

      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: {
          startedAt: null,
          status: progress === 100 ? 'DONE' : 'TODO',
          progress,
          completed: progress === 100,
          totalWorkHours: task.totalWorkHours + durationMinutes,
        },
      });

      // 2. Update module progress
      await this.progressService.updateModuleProgress(task.moduleId);

      // 3. Update project progress
      await this.progressService.updateProjectProgress(task.projectId);
      return {
        message: 'Task successfully ended',
        data: {
          task: updatedTask,
          workSession,
        },
      };
    });
  }
}
