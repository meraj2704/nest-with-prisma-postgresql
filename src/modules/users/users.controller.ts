import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AllUserDto } from './dto/all-user.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @Roles(UserRole.MANAGER, UserRole.TEAM_LEAD)
  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Conflict - User already exists' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [AllUserDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('team-members')
  @ApiOperation({ summary: "Retrieve the current user's department team" })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched team members',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  usersAsTeamMembers(@GetUser('departmentId') departmentId: number) {
    return this.usersService.usersAsTeam(departmentId);
  }

  @Get('assigned-projects')
  @Roles(UserRole.TEAM_LEAD, UserRole.MANAGER, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Get assigned projects for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched user projects',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  userAssignedProjects(@GetUser('userId') userId: number) {
    return this.usersService.userAssignedProjects(userId);
  }

  @Get('assigned-modules')
  @Roles(UserRole.TEAM_LEAD, UserRole.MANAGER, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Get assigned modules for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched user modules',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  userAssignedModules(@GetUser('userId') userId: number) {
    return this.usersService.userAssignedModules(userId);
  }

  @Get('user-details/:id')
  @Roles(UserRole.TEAM_LEAD, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched user details',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  userDetails(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.userDetails(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: AllUserDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: AllUserDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.TEAM_LEAD, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 200, description: 'User removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
