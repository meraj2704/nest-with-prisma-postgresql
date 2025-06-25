import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  DeveloperDashboardResponse,
  ManagerDashboardResponse,
  TeamLeadDashboardResponse,
} from './dto/dashboard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

// Response DTOs

@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('manager')
  @UseGuards(RolesGuard)
  @Roles('MANAGER')
  @ApiOperation({
    summary: 'Get manager dashboard data',
    description: 'Returns comprehensive statistics and overview for managers',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved manager dashboard data',
    type: ManagerDashboardResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid authentication token required',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - user does not have manager privileges',
  })
  managerDashboard() {
    return this.dashboardService.managerDashboard();
  }

  @Get('team-lead')
  @UseGuards(RolesGuard)
  @Roles('TEAM_LEAD')
  @ApiOperation({
    summary: 'Get team lead dashboard data',
    description: 'Returns team-specific statistics and overview for team leads',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved team lead dashboard data',
    type: TeamLeadDashboardResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid authentication token required',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - user does not have team lead privileges',
  })
  teamLeadDashboard(@Request() req) {
    return this.dashboardService.teamLeadDashboard(req.user.departmentId);
  }

  @Get('developer')
  @UseGuards(RolesGuard)
  @Roles('DEVELOPER')
  @ApiOperation({
    summary: 'Get developer dashboard data',
    description: 'Returns task and productivity data for individual developers',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved developer dashboard data',
    type: DeveloperDashboardResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid authentication token required',
  })
  developerDashboard(@Request() req) {
    return this.dashboardService.developerDashboard(req.user.userId);
  }
}
