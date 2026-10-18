import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ModuleService } from './module.service.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Module')
@Controller('module')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new module' })
  @ApiBody({ type: CreateModuleDto })
  @ApiCreatedResponse({
    description: 'Module successfully created',
    type: CreateModuleDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  async create(@Body() createModuleDto: CreateModuleDto) {
    return await this.moduleService.create(createModuleDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all modules' })
  @ApiResponse({
    status: 200,
    description: 'List of all modules',
    type: [CreateModuleDto],
  })
  async findAll() {
    return await this.moduleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a module by ID' })
  @ApiResponse({
    status: 200,
    description: 'Module details',
    type: CreateModuleDto,
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.moduleService.findOne(id);
  }

  @Get('by-project/:id')
  @ApiOperation({ summary: 'Get a module by Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully module fetched by project',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found by this id',
  })
  async findByProjectId(@Param('id', ParseIntPipe) id: number) {
    return await this.moduleService.findByProjectId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a module by ID' })
  @ApiResponse({
    status: 200,
    description: 'Module successfully updated',
    type: CreateModuleDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return await this.moduleService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a module by ID' })
  @ApiResponse({
    status: 200,
    description: 'Module successfully deleted',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moduleService.remove(id);
  }

  @Get('assign-developers/:id')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'TEAM_LEAD')
  @ApiOperation({ summary: 'Get all assign developers by module id' })
  @ApiResponse({
    status: 200,
    description: 'Module successfully deleted',
  })
  assignedDevelopers(@Param('id', ParseIntPipe) id: number) {
    return this.moduleService.assignedDevelopers(id);
  }
}
