import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('module')
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
  async findOne(@Param('id') id: string) {
    return await this.moduleService.findOne(+id);
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
  async findByProjectId(@Param('id') id: string) {
    return await this.moduleService.findByProjectId(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a module by ID' })
  @ApiResponse({
    status: 200,
    description: 'Module successfully updated',
    type: CreateModuleDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return await this.moduleService.update(+id, updateModuleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a module by ID' })
  @ApiResponse({
    status: 200,
    description: 'Module successfully deleted',
  })
  remove(@Param('id') id: string) {
    return this.moduleService.remove(+id);
  }
}
