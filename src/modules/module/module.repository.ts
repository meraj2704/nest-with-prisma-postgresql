import { Injectable } from '@nestjs/common';
import { Module, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ModuleRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    data: Prisma.ModuleCreateInput,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<Module> {
    return client.module.create({ data });
  }

  async findAllWithStats() {
    return this.prisma.module.findMany({
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
        _count: { select: { assignedDevelopers: true } },
        tasks: { select: { id: true, completed: true } },
      },
    });
  }

  async findDetails(id: number) {
    return this.prisma.module.findUnique({
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
          select: { id: true, fullName: true, role: true },
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
            project: { select: { id: true, name: true } },
            assignedUser: {
              select: { id: true, fullName: true, role: true },
            },
          },
        },
      },
    });
  }

  async findByProjectId(projectId: number): Promise<Module[]> {
    return this.prisma.module.findMany({ where: { projectId } });
  }

  async update(id: number, data: Prisma.ModuleUpdateInput): Promise<Module> {
    return this.prisma.module.update({ where: { id }, data });
  }

  async remove(id: number): Promise<Module> {
    return this.prisma.module.delete({ where: { id } });
  }

  async findAssignedDevelopers(id: number) {
    return this.prisma.module.findUnique({
      where: { id },
      select: {
        assignedDevelopers: {
          select: { id: true, fullName: true, role: true },
        },
      },
    });
  }

  /** Adds users to the project's member list (no-op for existing members). */
  async addProjectMembers(
    projectId: number,
    userIds: number[],
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    return client.project.update({
      where: { id: projectId },
      data: { members: { connect: userIds.map((id) => ({ id })) } },
    });
  }

  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(fn);
  }
}
