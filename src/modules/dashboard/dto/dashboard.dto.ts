import { ApiProperty } from '@nestjs/swagger';

export class ManagerDashboardResponse {
  @ApiProperty({
    example: 5,
    description: 'Total number of active projects',
  })
  totalProjects: number;

  @ApiProperty({
    example: 3,
    description: 'Number of projects behind schedule',
  })
  behindScheduleProjects: number;

  @ApiProperty({
    example: 75,
    description: 'Overall completion percentage across all projects',
  })
  overallCompletion: number;

  @ApiProperty({
    example: [
      {
        department: 'Frontend',
        completedTasks: 42,
        inProgressTasks: 18,
        overdueTasks: 5,
      },
    ],
    description: 'Department-wise breakdown of tasks',
  })
  departmentStats: any[];

  @ApiProperty({
    example: [
      {
        id: 1,
        name: 'Project Alpha',
        progress: 80,
        dueDate: '2023-12-31',
      },
    ],
    description: 'List of high priority projects',
  })
  highPriorityProjects: any[];
}

export class TeamLeadDashboardResponse {
  @ApiProperty({
    example: 3,
    description: 'Number of projects under the team lead',
  })
  myProjects: number;

  @ApiProperty({
    example: 25,
    description: 'Total tasks in the team',
  })
  teamTasks: number;

  @ApiProperty({
    example: 18,
    description: 'Tasks completed by the team',
  })
  completedTasks: number;

  @ApiProperty({
    example: [
      {
        id: 1,
        name: 'John Doe',
        completedTasks: 8,
        inProgressTasks: 3,
      },
    ],
    description: 'Team member productivity stats',
  })
  teamProductivity: any[];

  @ApiProperty({
    example: [
      {
        id: 1,
        title: 'Implement auth module',
        status: 'IN_PROGRESS',
        dueDate: '2023-11-15',
      },
    ],
    description: 'Upcoming critical tasks',
  })
  criticalTasks: any[];
}

export class DeveloperDashboardResponse {
  @ApiProperty({
    example: 8,
    description: 'Total tasks assigned to the developer',
  })
  myTasks: number;

  @ApiProperty({
    example: 5,
    description: 'Completed tasks',
  })
  completedTasks: number;

  @ApiProperty({
    example: 2,
    description: 'Tasks in progress',
  })
  inProgressTasks: number;

  @ApiProperty({
    example: 1,
    description: 'Overdue tasks',
  })
  overdueTasks: number;

  @ApiProperty({
    example: [
      {
        id: 1,
        title: 'Fix login bug',
        project: 'Website Redesign',
        dueDate: '2023-11-10',
        priority: 'HIGH',
      },
    ],
    description: 'List of current tasks with details',
  })
  taskList: any[];

  @ApiProperty({
    example: 12.5,
    description: 'Total hours logged this week',
  })
  weeklyHours: number;
}
