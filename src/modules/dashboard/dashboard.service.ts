import { Injectable } from '@nestjs/common';
import { Validator } from '../../common/validation/validator.service.js';
import { DashboardRepository } from './dashboard.repository.js';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class DashboardService {
  constructor(
    private readonly repository: DashboardRepository,
    private readonly validator: Validator,
  ) {}

  async managerDashboard() {
    return 'This action adds a manager dashboard';
  }

  async teamLeadDashboard(departmentId: number) {
    const [projects, modules, tasks] = await Promise.all([
      this.repository.findDepartmentProjects(departmentId),
      this.repository.findDepartmentModules(departmentId),
      this.repository.findDepartmentTasks(departmentId),
    ]);

    const now = new Date();
    const twoWeeksLater = new Date(now.getTime() + 14 * DAY_MS);
    const threeDaysLater = new Date(now.getTime() + 3 * DAY_MS);
    const tomorrow = new Date(now.getTime() + DAY_MS);

    const totalProject = projects.length;
    const completedProject = projects.filter((p) => p.completed).length;
    const upcomingDueProjects = projects.filter(
      (p) => !p.completed && p.dueDate >= now && p.dueDate <= twoWeeksLater,
    ).length;

    const totalModules = modules.length;
    const completedModules = modules.filter((m) => m.completed).length;
    const upcomingDueModules = modules.filter(
      (m) =>
        !m.completed &&
        m.endDate &&
        m.endDate >= now &&
        m.endDate <= threeDaysLater,
    ).length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const todayDueTasks = tasks.filter(
      (t) =>
        !t.completed && t.dueDate && t.dueDate >= now && t.dueDate <= tomorrow,
    ).length;

    return {
      message: 'Successfully fetched Team lead dashboard',
      data: {
        project: {
          totalProject,
          completedProject,
          activeProjects: totalProject - completedProject,
          inTwoWeeks: upcomingDueProjects,
        },
        projectsOverview: projects.slice(0, 5),
        module: {
          totalModules,
          completedModules,
          activeModules: totalModules - completedModules,
          inTwoDays: upcomingDueModules,
        },
        modulesOverview: modules.slice(0, 5),
        tasks: {
          totalTasks,
          completedTasks,
          activeTasks: totalTasks - completedTasks,
          todayDueTasks,
        },
        tasksOverview: tasks.slice(0, 5),
      },
    };
  }

  async developerDashboard(userId: number) {
    await this.validator.validateUserExist(userId);
    const [tasks, projects] = await Promise.all([
      this.repository.findUserTasks(userId),
      this.repository.findUserProjects(userId),
    ]);

    return {
      message: 'Successfully fetched dashboard data',
      data: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'DONE').length,
        inProgressTasks: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        notStartedTasks: tasks.filter((t) => t.status === 'TODO').length,
        totalProjects: projects.length,
        completedProjects: projects.filter((p) => p.completed).length,
        upcomingDueTasks: tasks.filter((t) => t.status !== 'DONE').slice(0, 5),
      },
    };
  }
}
