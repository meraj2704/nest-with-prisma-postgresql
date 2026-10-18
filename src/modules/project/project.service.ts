import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Validator } from '../../common/validation/validator.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectRepository } from './project.repository.js';

@Injectable()
export class ProjectService {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly validator: Validator,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    await this.validator.validateProjectExistWitName(createProjectDto.name);
    const { departmentId, ...projectData } = createProjectDto;
    const project = await this.repository.create({
      ...projectData,
      Department: { connect: { id: departmentId } },
    });
    return {
      message: 'Project successfully created',
      data: project,
    };
  }

  async findAll() {
    const [projects, completed] = await Promise.all([
      this.repository.findAllWithCounts(),
      this.repository.completedCountsByProject(),
    ]);

    const data = projects.map(({ _count, ...project }) => ({
      ...project,
      totalTasks: _count.tasks,
      completedTasks: completed.tasks.get(project.id) ?? 0,
      totalModules: _count.modules,
      completedModules: completed.modules.get(project.id) ?? 0,
      members: _count.members,
    }));
    return {
      message: 'Projects successfully retrieved',
      data,
    };
  }

  async findOne(id: number) {
    const project = await this.repository.findDetails(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const { tasks, modules, ...othersData } = project;
    const totalBufferTime = modules.reduce(
      (sum, module) => sum + (module.bufferTime || 0),
      0,
    );
    const totalBuildTime = modules.reduce(
      (sum, module) => sum + (module.buildTime || 0),
      0,
    );

    return {
      message: 'Project successfully retrieved',
      data: {
        ...othersData,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.completed).length,
        totalModule: modules.length,
        completedModules: modules.filter((m) => m.completed).length,
        totalBufferTime,
        totalBuildTime,
        overview: {
          active: project.active,
          priority: project.priority,
          type: project.type,
          modules: modules.length,
          startDate: project.createdAt,
          endDate: project.dueDate,
          progress: project.progress,
          totalBufferTime,
          totalBuildTime,
        },
        modules: modules.map(({ tasks, _count, ...module }) => ({
          ...module,
          totalTask: tasks.length,
          completedTasks: tasks.filter((t) => t.completed).length,
          developers: _count.assignedDevelopers,
        })),
      },
    };
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    await this.validator.validateProjectExists(id);
    const { departmentId, ...projectData } = updateProjectDto;
    const project = await this.repository.update(id, {
      ...projectData,
      ...(departmentId !== undefined && {
        Department: { connect: { id: departmentId } },
      }),
    });
    return {
      message: 'Project successfully updated',
      data: project,
    };
  }

  async remove(id: number) {
    await this.validator.validateProjectExists(id);
    try {
      const project = await this.repository.remove(id);
      return {
        message: 'Project successfully deleted',
        data: project,
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

  async projectMembers(id: number) {
    await this.validator.validateProjectExists(id);
    const project = await this.repository.findMembers(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    const { _count, ...otherData } = project;
    return {
      message: 'Fetched all developers for this project',
      data: {
        ...otherData,
        totalDevelopers: _count.members,
      },
    };
  }
}
