import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { EndTaskDto } from './dto/end-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('task')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // *************************************
  // ******** CREATE TASK API ************
  // *************************************
  @Post('create')
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: 'Task successfully created.',
    type: CreateTaskDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  // *************************************
  // ********** GET ALL TASK *************
  // *************************************
  @Get('management/dashboard')
  @ApiOperation({ summary: 'Retrieve all data for Task Management Dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Task Management Dashboard Data successfully retrieved.',
    type: [CreateTaskDto],
  })
  taskManagementDashboard() {
    return this.taskService.taskManagementDashboard();
  }

  // *************************************
  // ********** GET ALL TASK *************
  // *************************************
  @Get('all')
  @ApiOperation({ summary: 'Retrieve all tasks' })
  @ApiResponse({
    status: 200,
    description: 'Tasks successfully retrieved.',
    type: [CreateTaskDto],
  })
  findAll() {
    return this.taskService.findAll();
  }

  // *************************************
  // ******** GET SINGLE TASK ************
  // *************************************
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a task by ID' })
  @ApiResponse({
    status: 200,
    description: 'Task successfully retrieved.',
    type: CreateTaskDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  findOne(@Param('id') id: string) {
    console.log('find here');
    return this.taskService.findOne(+id);
  }

  // *********************************************
  // ******** GET ALL TASK PROJECT ID ************
  // *********************************************
  @Get('by-project/:id')
  @ApiOperation({ summary: 'Retrieve all tasks by Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Task successfully retrieved.',
    type: CreateTaskDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 404, description: 'Project not found by id' })
  findByProjectId(@Param('id') id: string) {
    return this.taskService.findByProjectId(+id);
  }

  // *********************************************
  // ******** GET ALL TASK MODULE ID ************
  // *********************************************
  @Get('by-module/:id')
  @ApiOperation({ summary: 'Retrieve all tasks by Module ID' })
  @ApiResponse({
    status: 200,
    description: 'Task successfully retrieved.',
    type: CreateTaskDto,
  })
  @ApiResponse({ status: 404, description: 'Module not found.' })
  @ApiResponse({ status: 404, description: 'Project not found by id' })
  findByModuleId(@Param('id') id: string) {
    return this.taskService.findByModuleId(+id);
  }

  // *************************************
  // *********** UPDATE TASK *************
  // *************************************
  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiResponse({
    status: 200,
    description: 'Task successfully updated.',
    type: CreateTaskDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  // *************************************
  // *********** REMOVE TASK *************
  // *************************************
  @Delete('remove/:id')
  @ApiOperation({ summary: 'Remove a task by ID' })
  @ApiResponse({ status: 200, description: 'Task successfully removed.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }

  // *************************************
  // ************ START TASK *************
  // *************************************
  @Post('start/:id')
  @ApiOperation({ summary: 'Start task with ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task successfully started',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not exist',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Task already complete',
  })
  start(@Param('id') id: number) {
    return this.taskService.startTask(id);
  }

  // *************************************
  // ************ END TASK *************
  // *************************************
  @Post('end/:id')
  @ApiOperation({ summary: 'End task with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task successfully ended',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not exist',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Task already complete',
  })
  end(@Param('id') id: number, @Body() endTaskDto: EndTaskDto) {
    return this.taskService.endTask(id, endTaskDto);
  }

  // *************************************
  // ************ My TASK TASK *************
  // *************************************
  @Get('my/tasks')
  @ApiOperation({ summary: 'My tasks' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task successfully fetched',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not exist',
  })
  myTask(@Request() req) {
    return this.taskService.myTask(req.user.userId);
  }
}
