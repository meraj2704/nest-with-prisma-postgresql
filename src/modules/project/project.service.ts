import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Validator } from 'src/common/validation/validator.service';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private validator: Validator,
  ) {}
  // *************************************
  // ********- CREATE SERVICE ************
  // *************************************
  async create(createProjectDto: CreateProjectDto) {
    await this.validator.validateProjectExistWitName(createProjectDto.name);
    const { departmentId, ...projectData } = createProjectDto;
    const project = await this.prisma.project.create({
      data: {
        ...projectData,
        Department: { connect: { id: departmentId } },
      },
    });
    return {
      message: 'Project successfully created',
      data: project,
    };
  }

  // *************************************
  // ******* FIND ALL SERVICE ************
  // *************************************

  async findAll() {
    const projects = await this.prisma.project.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        priority: true,
        progress: true,
        dueDate: true,
        completed: true,
        _count: {
          select: {
            modules: true,
            tasks: true,
            members: true,
          },
        },
      },
    });

    const projectStats = await Promise.all(
      projects.map(async ({ _count, ...project }) => {
        const [completedTasks, completedModules] = await Promise.all([
          this.prisma.task.count({
            where: {
              projectId: project.id,
              completed: true,
            },
          }),
          this.prisma.module.count({
            where: {
              projectId: project.id,
              completed: true,
            },
          }),
        ]);
        return {
          ...project,
          totalTasks: _count.tasks,
          completedTasks,
          totalModules: _count.modules,
          completedModules,
          members: _count.members,
        };
      }),
    );
    return {
      message: 'Projects successfully retrieved',
      data: projectStats,
    };
  }

  // *************************************
  // ******* FIND ONE SERVICE ************
  // *************************************

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        priority: true,
        progress: true,
        active: true,
        createdAt: true,
        dueDate: true,
        tasks: {
          select: {
            id: true,
            completed: true,
          },
        },
        modules: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            priority: true,
            completed: true,
            progress: true,
            bufferTime: true,
            buildTime: true,
            startDate: true,
            endDate: true,
            estimatedHours: true,
            totalWorkHours: true,
            _count: {
              select: {
                assignedDevelopers: true,
              },
            },
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
                completed: true,
              },
            },
          },
        },
      },
    });

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
          completedTasks: tasks.filter((m) => m.completed).length,
          developers: _count.assignedDevelopers,
        })),
      },
    };
  }

  // *************************************
  // *******-- UPDATE SERVICE ************
  // *************************************

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    const project = await this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return {
      message: 'Project successfully updated',
      data: project,
    };
  }

  // *************************************
  // *******-- REMOVE SERVICE ************
  // *************************************

  async remove(id: number) {
    try {
      const project = await this.prisma.project.delete({ where: { id } });
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      return {
        message: 'Project successfully deleted',
        data: project,
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

  // *************************************
  // ********* Project Team ************
  // *************************************

  async projectMembers(id: number) {
    await this.validator.validateProjectExists(id);
    const members = await this.prisma.project.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          select: {
            id: true,
            fullName: true,
            role: true,
            assignedModules: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    const { _count, ...otherData } = members;
    return {
      message: 'Fetched all developers for this project',
      data: {
        ...otherData,
        totalDevelopers: _count.members,
      },
    };
  }
}
