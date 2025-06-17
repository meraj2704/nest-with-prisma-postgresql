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

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private progressService: ProgressService,
  ) {}
  async create(createTaskDto: CreateTaskDto) {
    const existProject = await this.prisma.project.findUnique({
      where: { id: createTaskDto.projectId },
    });
    if (!existProject) {
      throw new NotFoundException(
        `Project with ID ${createTaskDto.projectId} not found`,
      );
    }
    const moduleExist = await this.prisma.module.findUnique({
      where: { id: createTaskDto.moduleId },
    });
    if (!moduleExist) {
      throw new NotFoundException(
        `Module with ID ${createTaskDto.moduleId} not found`,
      );
    }
    if (existProject.id !== moduleExist.projectId) {
      throw new NotFoundException(`Module not exist in Project`);
    }
    const task = await this.prisma.task.create({
      data: createTaskDto,
    });
    return {
      message: 'Task successfully created',
      data: task,
    };
  }

  async findAll() {
    const tasks = await this.prisma.task.findMany();
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
