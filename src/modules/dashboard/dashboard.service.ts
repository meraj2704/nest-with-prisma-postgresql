import { Injectable } from '@nestjs/common';
import { Validator } from '../../../src/common/validation/validator.service';
import { PrismaService } from '../../../src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private validator: Validator,
  ) {}
  async managerDashboard() {
    return 'This action adds a manager dashboard';
  }
  async teamLeadDashboard(id: number) {
    const projects = await this.prisma.project.findMany({
      where: {
        departmentId: id,
      },
      select: {
        id: true,
        name: true,
        completed: true,
        dueDate: true,
        progress: true,
      },
      orderBy: [
        {
          completed: 'asc',
        },
        {
          dueDate: 'asc',
        },
      ],
    });

    const modules = await this.prisma.module.findMany({
      where: { departmentId: id },
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
      orderBy: [
        {
          completed: 'asc',
        },
        {
          endDate: 'asc',
        },
      ],
    });

    const tasks = await this.prisma.task.findMany({
      where: { departmentId: id },
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
      orderBy: [
        {
          completed: 'asc',
        },
        {
          dueDate: 'asc',
        },
      ],
    });

    const now = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(now.getDate() + 14);
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);
    const today = new Date();
    today.setDate(now.getDate() + 1);

    const totalProject = projects.length;
    const completedProject = projects.filter(
      (p) => p.completed === true,
    ).length;
    const activeProjects = totalProject - completedProject;
    const upcomingDueProjects = projects.filter((project) => {
      return (
        !project.completed &&
        project.dueDate &&
        project.dueDate >= now &&
        project.dueDate <= twoWeeksLater
      );
    }).length;

    const totalModules = modules.length;
    const completedModules = modules.filter((m) => m.completed).length;
    const activeModules = totalModules - completedModules;
    const upcomingDueModules = modules.filter((m) => {
      return (
        !m.completed &&
        m.endDate &&
        m.endDate >= now &&
        m.endDate <= threeDaysLater
      );
    }).length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const activeTasks = totalTasks - completedTasks;
    const todayDueTasks = tasks.filter((m) => {
      return (
        !m.completed && m.dueDate && m.dueDate >= now && m.dueDate <= today
      );
    }).length;

    return {
      message: 'Successfully fetched Team lead dashboard',
      data: {
        project: {
          totalProject,
          completedProject,
          activeProjects,
          inTwoWeeks: upcomingDueProjects,
        },
        projectsOverview: projects.slice(0, 5),
        module: {
          totalModules,
          completedModules,
          activeModules,
          inTwoDays: upcomingDueModules,
        },
        modulesOverview: modules.slice(0, 5),
        tasks: {
          totalTasks,
          completedTasks,
          activeTasks,
          todayDueTasks,
        },
        tasksOverview: tasks.slice(0, 5),
      },
    };
  }
  async developerDashboard(id: number) {
    await this.validator.validateUserExist(id);
    const tasks = await this.prisma.task.findMany({
      where: {
        assignedUserId: id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        module: {
          select: {
            id: true,
            name: true,
          },
        },
        status: true,
        priority: true,
        type: true,
        dueDate: true,
        progress: true,
        estimatedHours: true,
        totalWorkHours: true,
        completed: true,
      },
      orderBy: [
        {
          completed: 'asc',
        },
        {
          dueDate: 'asc',
        },
      ],
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
    const nonCompletedTasks = tasks
      .filter((t) => t.status !== 'DONE')
      .slice(0, 5);
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
        upcomingDueTasks: nonCompletedTasks,
      },
    };
  }
}
