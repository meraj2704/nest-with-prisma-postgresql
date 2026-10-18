import { Injectable } from '@nestjs/common';
import { Prisma, Task, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

const myTaskSelect = {
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
} satisfies Prisma.TaskSelect;

type Client = Prisma.TransactionClient | PrismaService;

@Injectable()
export class TaskRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return this.prisma.task.create({ data });
  }

  async countByStatus() {
    const rows = await this.prisma.task.groupBy({
      by: ['status'],
      orderBy: { status: 'asc' },
      _count: { _all: true },
    });
    const counts: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };
    for (const row of rows) {
      counts[row.status] = (row._count as { _all: number })._all;
    }
    return counts;
  }

  async findAllWithRelations() {
    return this.prisma.task.findMany({
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
        status: true,
        project: { select: { id: true, name: true } },
        module: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, fullName: true } },
      },
    });
  }

  async findById(id: number, client: Client = this.prisma) {
    return client.task.findUnique({ where: { id } });
  }

  async findByProjectId(projectId: number): Promise<Task[]> {
    return this.prisma.task.findMany({ where: { projectId } });
  }

  async findByModuleId(moduleId: number): Promise<Task[]> {
    return this.prisma.task.findMany({ where: { moduleId } });
  }

  async update(
    id: number,
    data: Prisma.TaskUpdateInput,
    client: Client = this.prisma,
  ): Promise<Task> {
    return client.task.update({ where: { id }, data });
  }

  async remove(id: number, client: Client = this.prisma): Promise<Task> {
    return client.task.delete({ where: { id } });
  }

  async createWorkSession(
    data: Prisma.WorkSessionUncheckedCreateInput,
    client: Client = this.prisma,
  ) {
    return client.workSession.create({ data });
  }

  async findAssignedTo(userId: number, completed: boolean) {
    return this.prisma.task.findMany({
      where: { assignedUserId: userId, completed },
      select: myTaskSelect,
      orderBy: [{ status: 'desc' }, { dueDate: 'asc' }],
    });
  }

  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(fn);
  }
}
