import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ProjectService } from './project.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@ApiTags('Projects')
@Controller('project')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiCreatedResponse({
    description: 'Project successfully created',
    type: CreateProjectDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async create(@Body() createProjectDto: CreateProjectDto) {
    return await this.projectService.create(createProjectDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all projects' })
  @ApiOkResponse({
    description: 'List of all projects',
    type: [CreateProjectDto],
  })
  async findAll() {
    return await this.projectService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Numeric ID of the project',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Project found',
    type: CreateProjectDto,
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.projectService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Numeric ID of the project to update',
    example: 1,
  })
  @ApiBody({ type: UpdateProjectDto })
  @ApiOkResponse({
    description: 'Project updated successfully',
    type: UpdateProjectDto,
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return await this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'TEAM_LEAD')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Numeric ID of the project to delete',
    example: 1,
  })
  @ApiOkResponse({ description: 'Project deleted successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.projectService.remove(id);
  }

  @Get('project-members/:id')
  @ApiOperation({ summary: 'Get all members for this project' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Numeric ID of the project to delete',
    example: 1,
  })
  @ApiOkResponse({ description: 'Fetched all members for this project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async projectMembers(@Param('id', ParseIntPipe) id: number) {
    return await this.projectService.projectMembers(id);
  }
}
