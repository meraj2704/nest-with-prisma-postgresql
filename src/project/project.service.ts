import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Validator } from 'src/common/validation/validator.service';

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
    const project = await this.prisma.project.create({
      data: createProjectDto,
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
    return {
      message: 'Project successfully retrieved',
      data: {
        ...othersData,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.completed).length,
        totalModule: modules.length,
        completedModules: modules.filter((m) => m.completed).length,
        modules: modules.map(({ tasks, ...module }) => ({
          ...module,
          totalTask: tasks.length,
          completedTasks: tasks.filter((m) => m.completed).length,
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
    const project = await this.prisma.project.delete({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return {
      message: 'Project successfully deleted',
      data: project,
    };
  }
}
