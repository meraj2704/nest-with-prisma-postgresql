import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Validator } from '../../common/validation/validator.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly validator: Validator,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.repository.findByEmailOrUsername(
      createUserDto.email,
      createUserDto.username,
    );
    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('User with this email already exists');
      }
      throw new ConflictException('User with this username already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const { password: _password, ...user } = await this.repository.create({
      username: createUserDto.username,
      fullName: createUserDto.full_name,
      email: createUserDto.email,
      phone: createUserDto.phone,
      Department: { connect: { id: createUserDto.departmentId } },
      password: hashedPassword,
    });

    return {
      message: 'User registered successfully',
      data: { user },
    };
  }

  async findAll() {
    return {
      message: 'Users retrieved successfully',
      data: await this.repository.findAll(),
    };
  }

  async findOne(id: number) {
    const user = await this.repository.findPublicById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.validator.validateUserExist(id);
    const { full_name, password, departmentId, ...rest } = updateUserDto;

    const data: Prisma.UserUpdateInput = { ...rest };
    if (full_name !== undefined) data.fullName = full_name;
    if (password !== undefined) data.password = await bcrypt.hash(password, 10);
    if (departmentId !== undefined) {
      data.Department = { connect: { id: departmentId } };
    }

    return {
      message: 'User updated successfully',
      data: await this.repository.update(id, data),
    };
  }

  async remove(id: number) {
    await this.validator.validateUserExist(id);
    try {
      await this.repository.remove(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Cannot delete this item because it is referenced by other records',
        );
      }
      throw error;
    }
    return {
      message: 'User removed successfully',
    };
  }

  async usersAsTeam(departmentId: number) {
    const teamMembers = await this.repository.findTeamMembers(departmentId);

    const data = teamMembers.map(
      ({ workSessions, assignedTasks, assignedModules, ...member }) => ({
        ...member,
        totalWorkingHours: parseFloat(
          (
            workSessions.reduce(
              (total, session) => total + session.durationMinutes,
              0,
            ) / 60
          ).toFixed(2),
        ),
        totalTasks: assignedTasks.length,
        completedTasks: assignedTasks.filter((t) => t.completed).length,
        totalModules: assignedModules.length,
        completedModules: assignedModules.filter((m) => m.completed).length,
      }),
    );
    return {
      message: 'Successfully fetched team members',
      data,
    };
  }

  async userAssignedProjects(id: number) {
    await this.validator.validateUserExist(id);
    const user = await this.repository.findAssignedProjects(id);
    return {
      message: 'Successfully fetched user projects',
      data: user?.projects ?? [],
    };
  }

  async userAssignedModules(id: number) {
    await this.validator.validateUserExist(id);
    const user = await this.repository.findAssignedModules(id);
    return {
      message: 'Successfully fetched user modules',
      data: user?.assignedModules ?? [],
    };
  }

  async userDetails(id: number) {
    await this.validator.validateUserExist(id);
    return {
      message: 'Successfully fetched user details',
      data: await this.repository.findDetails(id),
    };
  }
}
