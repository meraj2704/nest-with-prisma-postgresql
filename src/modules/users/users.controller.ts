import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  // ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AllUserDto } from './dto/all-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
// import { Roles } from '../auth/decorator/roles.decorator';

@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'TEAM_LEAD')
  @ApiOperation({ summary: 'User Registration' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User Created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Conflict - User already exists' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [AllUserDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  usersAsTeamMembers(@Request() req) {
    return this.usersService.usersAsTeam(req.user.departmentId);
  }

  @Get('/assigned-projects')
  @UseGuards(RolesGuard)
  @Roles('TEAM_LEAD', 'MANAGER', 'DEVELOPER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get assigned projects for a user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched user projects',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  userAssignedProjects(@Request() req) {
    console.log('user id', req.user.userId);
    return this.usersService.userAssignedProjects(req.user.userId);
  }

  @Get('/assigned-modules')
  @UseGuards(RolesGuard)
  @Roles('TEAM_LEAD', 'MANAGER', 'DEVELOPER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get assigned modules for a user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched user modules',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  userAssignedModules(@Request() req) {
    console.log('user id', req.user.userId);
    return this.usersService.userAssignedModules(req.user.userId);
  }

  @Get('/user-details/:id')
  @UseGuards(RolesGuard)
  @Roles('TEAM_LEAD', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched user details',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  userDetails(@Param('id') id: string) {
    return this.usersService.userDetails(Number(id));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: AllUserDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: AllUserDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('TEAM_LEAD', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User removed successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
