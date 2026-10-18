import {
  ConflictException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProgressService } from '../../common/services/progress.service.js';
import { Validator } from '../../common/validation/validator.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { EndTaskDto } from './dto/end-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskRepository } from './task.repository.js';

@Injectable()
export class TaskService {
  constructor(
    private readonly repository: TaskRepository,
    private readonly progressService: ProgressService,
    private readonly validator: Validator,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const {
      title,
      description,
      type,
      priority,
      dueDate,
      estimatedHours,
      moduleId,
      assignedUser,
      departmentId,
    } = createTaskDto;

    const module = await this.validator.validateModuleAlsoUser(
      moduleId,
      assignedUser,
    );

    const task = await this.repository.create({
      title,
      description,
      type,
      priority,
      dueDate,
      estimatedHours,
      module: { connect: { id: moduleId } },
      project: { connect: { id: module.projectId } },
      assignedUser: { connect: { id: assignedUser } },
      Department: { connect: { id: departmentId } },
    });
    await this.progressService.updateModuleProgress(moduleId);
    await this.progressService.updateProjectProgress(module.projectId);

    return {
      message: 'Task successfully created',
      data: task,
    };
  }

  async taskManagementDashboard() {
    const counts = await this.repository.countByStatus();
    return {
      message: 'Tasks successfully retrieved',
      data: {
        totalTasks: counts.TODO + counts.IN_PROGRESS + counts.DONE,
        completedTasks: counts.DONE,
        notStartedTasks: counts.TODO,
        inProgressTask: counts.IN_PROGRESS,
      },
    };
  }

  async findAll() {
    const tasks = await this.repository.findAllWithRelations();
    return {
      message: 'Tasks successfully retrieved',
      data: tasks.map(({ project, module, assignedUser, ...rest }) => ({
        ...rest,
        project: project.name,
        projectId: project.id,
        module: module.name,
        moduleId: module.id,
        assignedUser: assignedUser?.fullName ?? null,
        assignedUserId: assignedUser?.id ?? null,
      })),
    };
  }

  async findOne(id: number) {
    return {
      message: 'Task successfully retrieved',
      data: await this.validator.validateTaskExists(id),
    };
  }

  async findByProjectId(projectId: number) {
    await this.validator.validateProjectExists(projectId);
    return {
      message: `Successfully fetch all task by project id ${projectId}`,
      data: await this.repository.findByProjectId(projectId),
    };
  }

  async findByModuleId(moduleId: number) {
    await this.validator.validateModuleExists(moduleId);
    return {
      message: `Successfully fetch all task by module id ${moduleId}`,
      data: await this.repository.findByModuleId(moduleId),
    };
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    await this.validator.validateTaskExists(id);
    const { assignedUserId, ...rest } = updateTaskDto;
    const task = await this.repository.update(id, {
      ...rest,
      ...(assignedUserId !== undefined && {
        assignedUser: { connect: { id: assignedUserId } },
      }),
    });
    return {
      message: 'Task successfully updated',
      data: task,
    };
  }

  async remove(id: number) {
    await this.validator.validateTaskExists(id);
    try {
      const task = await this.repository.transaction(async (tx) => {
        const deleted = await this.repository.remove(id, tx);
        await this.progressService.updateModuleProgress(deleted.moduleId, tx);
        await this.progressService.updateProjectProgress(deleted.projectId, tx);
        return deleted;
      });
      return {
        message: 'Task successfully removed',
        data: task,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Cannot delete this item because it is referenced by other records',
        );
      }
      throw error;
    }
  }

  async startTask(id: number) {
    const task = await this.repository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    if (task.status === 'IN_PROGRESS') {
      throw new PreconditionFailedException('Task is already in progress');
    }
    if (task.status === 'DONE') {
      throw new ConflictException('Task is already completed');
    }
    return {
      message: 'Task successfully started',
      data: await this.repository.update(id, {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      }),
    };
  }

  async endTask(id: number, endTaskDto: EndTaskDto, userId: number) {
    const { progress, summary } = endTaskDto;
    this.validator.validateProgress(progress);

    return this.repository.transaction(async (tx) => {
      const task = await this.repository.findById(id, tx);
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      this.validator.validateTaskInProgress(task);
      this.validator.validateTaskNotCompleted(task);

      // IN_PROGRESS is only ever set together with startedAt
      const startedAt = task.startedAt as Date;
      const now = new Date();
      const durationMinutes = Math.floor(
        (now.getTime() - startedAt.getTime()) / (1000 * 60),
      );

      const workSession = await this.repository.createWorkSession(
        {
          start: startedAt,
          end: now,
          durationMinutes,
          summary,
          progress,
          taskId: id,
          projectId: task.projectId,
          moduleId: task.moduleId,
          userId,
          departmentId: task.departmentId,
        },
        tx,
      );

      const updatedTask = await this.repository.update(
        id,
        {
          startedAt: null,
          status: progress === 100 ? 'DONE' : 'TODO',
          progress,
          completed: progress === 100,
          totalWorkHours: { increment: durationMinutes / 60 },
        },
        tx,
      );

      await this.progressService.updateModuleProgress(task.moduleId, tx);
      await this.progressService.updateProjectProgress(task.projectId, tx);

      return {
        message: 'Task successfully ended',
        data: {
          task: updatedTask,
          workSession,
        },
      };
    });
  }

  async myTask(userId: number) {
    await this.validator.validateUserExist(userId);
    return {
      message: 'Tasks fetched successfully',
      data: await this.repository.findAssignedTo(userId, false),
    };
  }

  async myCompletedTask(userId: number) {
    await this.validator.validateUserExist(userId);
    return {
      message: 'Completed Tasks fetched successfully',
      data: await this.repository.findAssignedTo(userId, true),
    };
  }
}
