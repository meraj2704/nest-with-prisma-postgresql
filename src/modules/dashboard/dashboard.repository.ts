import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class DashboardRepository {
  constructor(private prisma: PrismaService) {}

  async findDepartmentProjects(departmentId: number) {
    return this.prisma.project.findMany({
      where: { departmentId },
      select: {
        id: true,
        name: true,
        completed: true,
        dueDate: true,
        progress: true,
      },
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }],
    });
  }

  async findDepartmentModules(departmentId: number) {
    return this.prisma.module.findMany({
      where: { departmentId },
      select: {
        id: true,
        name: true,
        type: true,
        priority: true,
        startDate: true,
        endDate: true,
        progress: true,
        completed: true,
      },
      orderBy: [{ completed: 'asc' }, { endDate: 'asc' }],
    });
  }

  async findDepartmentTasks(departmentId: number) {
    return this.prisma.task.findMany({
      where: { departmentId },
      select: {
        id: true,
        title: true,
        type: true,
        priority: true,
        dueDate: true,
        progress: true,
        completed: true,
        status: true,
      },
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }],
    });
  }

  async findUserTasks(userId: number) {
    return this.prisma.task.findMany({
      where: { assignedUserId: userId },
      select: {
        id: true,
        title: true,
        description: true,
        project: { select: { id: true, name: true } },
        module: { select: { id: true, name: true } },
        status: true,
        priority: true,
        type: true,
        dueDate: true,
        progress: true,
        estimatedHours: true,
        totalWorkHours: true,
        completed: true,
      },
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }],
    });
  }

  async findUserProjects(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { projects: { select: { id: true, completed: true } } },
    });
    return user?.projects ?? [];
  }
}
