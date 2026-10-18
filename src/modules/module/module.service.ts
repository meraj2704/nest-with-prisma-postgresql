import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Validator } from '../../common/validation/validator.service.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';
import { ModuleRepository } from './module.repository.js';

@Injectable()
export class ModuleService {
  constructor(
    private readonly repository: ModuleRepository,
    private readonly validator: Validator,
  ) {}

  async create(createModuleDto: CreateModuleDto) {
    const {
      assignedDeveloperIds = [],
      departmentId,
      projectId,
      ...restData
    } = createModuleDto;
    await this.validator.validateProjectExists(projectId);
    await this.validator.validateUsersExist(assignedDeveloperIds);

    const module = await this.repository.transaction(async (tx) => {
      const created = await this.repository.create(
        {
          ...restData,
          Department: { connect: { id: departmentId } },
          assignedDevelopers: {
            connect: assignedDeveloperIds.map((id) => ({ id })),
          },
          project: { connect: { id: projectId } },
        },
        tx,
      );
      if (assignedDeveloperIds.length) {
        await this.repository.addProjectMembers(
          projectId,
          assignedDeveloperIds,
          tx,
        );
      }
      return created;
    });

    return {
      message: 'Module successfully created',
      data: module,
    };
  }

  async findAll() {
    const modules = await this.repository.findAllWithStats();
    const data = modules.map(({ _count, tasks, ...otherData }) => ({
      ...otherData,
      member: _count.assignedDevelopers,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((task) => task.completed).length,
    }));
    return {
      message: 'Modules found',
      data,
    };
  }

  async findOne(id: number) {
    const module = await this.repository.findDetails(id);
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    const { assignedDevelopers, tasks, ...otherData } = module;

    return {
      message: 'Module found',
      data: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((task) => task.completed).length,
        member: assignedDevelopers.length,
        tasks,
        assignedDevelopers,
        ...otherData,
      },
    };
  }

  async findByProjectId(projectId: number) {
    await this.validator.validateProjectExists(projectId);
    return {
      message: 'Module found',
      data: await this.repository.findByProjectId(projectId),
    };
  }

  async update(id: number, updateModuleDto: UpdateModuleDto) {
    await this.validator.validateModuleExists(id);
    const { assignedDeveloperIds } = updateModuleDto;
    if (assignedDeveloperIds) {
      await this.validator.validateUsersExist(assignedDeveloperIds);
    }
    const module = await this.repository.update(id, {
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
        connect: assignedDeveloperIds?.map((id) => ({ id })) || [],
      },
    });
    return {
      message: 'Module successfully updated',
      data: module,
    };
  }

  async remove(id: number) {
    await this.validator.validateModuleExists(id);
    try {
      const module = await this.repository.remove(id);
      return {
        message: 'Module successfully deleted',
        data: module,
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

  async assignedDevelopers(id: number) {
    await this.validator.validateModuleExists(id);
    return {
      message: 'Assign developer for the project',
      data: await this.repository.findAssignedDevelopers(id),
    };
  }
}
