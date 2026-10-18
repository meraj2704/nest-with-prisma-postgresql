import { Injectable } from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ProjectRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProjectCreateInput): Promise<Project> {
    return this.prisma.project.create({ data });
  }

  async findAllWithCounts() {
    return this.prisma.project.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        priority: true,
        progress: true,
        dueDate: true,
        completed: true,
        _count: { select: { modules: true, tasks: true, members: true } },
      },
    });
  }

  /** Completed task and module counts per project, keyed by project id. */
  async completedCountsByProject() {
    const [tasks, modules] = await this.prisma.$transaction([
      this.prisma.task.groupBy({
        by: ['projectId'],
        where: { completed: true },
        orderBy: { projectId: 'asc' },
        _count: { _all: true },
      }),
      this.prisma.module.groupBy({
        by: ['projectId'],
        where: { completed: true },
        orderBy: { projectId: 'asc' },
        _count: { _all: true },
      }),
    ]);
    const toMap = (rows: { projectId: number; _count: unknown }[]) =>
      new Map(
        rows.map((row) => [
          row.projectId,
          (row._count as { _all: number })._all,
        ]),
      );
    return { tasks: toMap(tasks), modules: toMap(modules) };
  }

  async findDetails(id: number) {
    return this.prisma.project.findUnique({
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
        tasks: { select: { id: true, completed: true } },
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
            _count: { select: { assignedDevelopers: true } },
            assignedDevelopers: {
              select: { id: true, fullName: true, role: true },
            },
            tasks: { select: { id: true, completed: true } },
          },
        },
      },
    });
  }

  async findByName(name: string): Promise<Project | null> {
    return this.prisma.project.findUnique({ where: { name } });
  }

  async update(id: number, data: Prisma.ProjectUpdateInput): Promise<Project> {
    return this.prisma.project.update({ where: { id }, data });
  }

  async remove(id: number): Promise<Project> {
    return this.prisma.project.delete({ where: { id } });
  }

  async findMembers(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        members: {
          select: {
            id: true,
            fullName: true,
            role: true,
            assignedModules: { select: { id: true, name: true } },
          },
        },
      },
    });
  }
}
