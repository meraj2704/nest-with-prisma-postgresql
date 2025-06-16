import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}
  async create(createProjectDto: CreateProjectDto) {
    const projectExistWithName = await this.prisma.project.findUnique({
      where: { name: createProjectDto.name },
    });
    if (projectExistWithName) {
      throw new NotFoundException(
        `Project with name ${createProjectDto.name} already exists`,
      );
    }
    const project = await this.prisma.project.create({
      data: createProjectDto,
    });
    return {
      message: 'Project successfully created',
      data: project,
    };
  }

  async findAll() {
    const projects = await this.prisma.project.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        priority: true,
      },
    });
    return {
      message: 'Projects successfully retrieved',
      data: projects,
    };
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return {
      message: 'Project successfully retrieved',
      data: project,
    };
  }

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
