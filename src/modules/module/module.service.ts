import { Validator } from 'src/common/validation/validator.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

@Injectable()
export class ModuleService {
  constructor(
    private prisma: PrismaService,
    private validator: Validator,
  ) {}
  async create(createModuleDto: CreateModuleDto) {
    await this.validator.validateProjectExists(createModuleDto.projectId);
    await this.validator.validateUsersExist(
      createModuleDto.assignedDeveloperIds,
    );
    const { assignedDeveloperIds, departmentId, projectId, ...restData } =
      createModuleDto;
    const module = await this.prisma.module.create({
      data: {
        ...restData,
        Department: { connect: { id: departmentId } },
        assignedDevelopers: {
          connect: assignedDeveloperIds?.map((id) => ({ id })) || [],
        },
        project: { connect: { id: projectId } },
      },
    });

    await this.prisma.project.update({
      where: { id: createModuleDto.projectId },
      data: {
        members: {
          connect: assignedDeveloperIds.map((id) => ({ id })),
        },
      },
    });
    return {
      message: 'Module successfully created',
      data: module,
    };
  }

  async findAll() {
    const modules = await this.prisma.module.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        priority: true,
        buildTime: true,
        bufferTime: true,
        startDate: true,
        endDate: true,
        estimatedHours: true,
        departmentId: true,
        projectId: true,
        completed: true,
        progress: true,

        _count: {
          select: {
            assignedDevelopers: true,
          },
        },
        tasks: {
          select: {
            id: true,
            completed: true,
          },
        },
      },
    });

    const newData = modules.map(({ _count, tasks, ...otherData }) => {
      return {
        ...otherData,
        member: _count.assignedDevelopers,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((task) => task.completed).length,
      };
    });
    return {
      message: 'Modules found',
      data: newData,
    };
  }

  async findOne(id: number) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        priority: true,
        buildTime: true,
        bufferTime: true,
        startDate: true,
        endDate: true,
        estimatedHours: true,
        departmentId: true,
        projectId: true,
        completed: true,
        progress: true,
        assignedDevelopers: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        tasks: {
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
            startedAt: true,
            status: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
            assignedUser: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });
    const { assignedDevelopers, tasks, ...otherData } = module;

    const newData = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((task) => task.completed).length,
      member: assignedDevelopers.length,
      tasks: tasks,
      assignedDevelopers: assignedDevelopers,
      ...otherData,
    };

    return {
      message: 'Module found',
      data: newData,
    };
  }
  async findByProjectId(id: number) {
    await this.validator.validateProjectExists(id);
    const modules = await this.prisma.module.findMany({
      where: { projectId: id },
    });
    return {
      message: 'Module found',
      data: modules,
    };
  }

  async update(id: number, updateModuleDto: UpdateModuleDto) {
    await this.validator.validateModuleExists(id);
    if (updateModuleDto.assignedDeveloperIds) {
      await this.validator.validateUsersExist(
        updateModuleDto.assignedDeveloperIds,
      );
    }
    return await this.prisma.module.update({
      where: { id },
      data: {
        name: updateModuleDto.name,
        description: updateModuleDto.description,
        type: updateModuleDto.type,
        priority: updateModuleDto.priority,
        buildTime: updateModuleDto.buildTime,
        bufferTime: updateModuleDto.bufferTime,
        startDate: updateModuleDto.startDate,
        endDate: updateModuleDto.endDate,
        estimatedHours: updateModuleDto.estimatedHours,
        assignedDevelopers: {
          connect:
            updateModuleDto.assignedDeveloperIds?.map((id) => ({ id })) || [],
        },
      },
    });
  }

  async remove(id: number) {
    try {
      const module = await this.prisma.module.delete({ where: { id } });
      if (!module) {
        throw new NotFoundException(`Module with ID ${id} not found`);
      }
      return {
        message: 'Module successfully deleted',
        data: module,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Cannot delete this item because it is referenced by other records',
          );
        }
      }
      throw error;
    }
  }

  async assignedDevelopers(id: number) {
    await this.validator.validateModuleExists(id);
    const developers = await this.prisma.module.findUnique({
      where: { id },
      select: {
        assignedDevelopers: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });
    return {
      message: 'Assign developer for the project',
      data: developers,
    };
  }
}
