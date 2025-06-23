import { Injectable } from '@nestjs/common';
import { Validator } from 'src/common/validation/validator.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private validator: Validator,
  ) {}
  async managerDashboard() {
    return 'This action adds a manager dashboard';
  }
  async teamLeadDashboard() {
    return 'This action adds a team lead dashboard';
  }
  async developerDashboard(id: number) {
    await this.validator.validateUserExist(id);
    const tasks = await this.prisma.task.findMany({
      where: {
        assignedUserId: id,
      },
      select: {
        id: true,
        status: true,
        title: true,
      },
    });
    const userProjects = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        projects: {
          select: {
            id: true,
            completed: true,
          },
        },
      },
    });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = tasks.filter(
      (t) => t.status === 'IN_PROGRESS',
    ).length;
    const totalProjects = userProjects.projects.length;
    const completedProjects = userProjects.projects.filter(
      (p) => p.completed,
    ).length;
    const notStartedTasks = tasks.filter((t) => t.status === 'TODO').length;

    return {
      message: 'Successfully fetched dashboard data',
      data: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        notStartedTasks,
        totalProjects,
        completedProjects,
      },
    };
  }
}
