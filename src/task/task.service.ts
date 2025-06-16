import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}
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
}
