import { Validator } from './../../common/validation/validator.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private validator: Validator,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      },
    });
    if (existingUser) {
      console.log('existingUser', existingUser);
      console.log('createUserDto', createUserDto);
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('User with this email already exists');
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('User with this username already exists');
      }
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        fullName: createUserDto.full_name,
        email: createUserDto.email,
        phone: createUserDto.phone,
        Department: { connect: { id: createUserDto.departmentId } },
        password: hashedPassword,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
      },
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: id },
      data: updateUserDto,
    });
    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  async remove(id: number) {
    try {
      await this.prisma.user.delete({
        where: { id: id },
      });
      return {
        message: 'User removed successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Cannot delete this item because it is referenced by other records',
          );
        }
      }
      throw error;
    }
  }

  async usersAsTeam(id: number) {
    const teamMembers = await this.prisma.user.findMany({
      where: { departmentId: id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        projects: {
          select: {
            id: true,
            name: true,
          },
        },
        workSessions: {
          select: {
            id: true,
            durationMinutes: true,
          },
        },
        assignedTasks: {
          select: {
            id: true,
            completed: true,
          },
        },
        assignedModules: {
          select: {
            id: true,
            completed: true,
          },
        },
      },
    });

    const dataFormat = teamMembers.map(
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
        completedModules: assignedModules.filter((t) => t.completed).length,
      }),
    );
    return {
      message: 'Successfully fetched team members',
      data: dataFormat,
    };
  }
  async userAssignedProjects(id: number) {
    console.log('id', id);
    await this.validator.validateUserExist(id);
    const projects = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        projects: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Successfully fetched user projects',
      data: projects.projects,
    };
  }
  async userAssignedModules(id: number) {
    console.log('id', id);
    await this.validator.validateUserExist(id);
    const modules = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        assignedModules: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Successfully fetched user modules',
      data: modules.assignedModules,
    };
  }

  async userDetails(id: number) {
    console.log('id', id);
    await this.validator.validateUserExist(id);
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        Department: {
          select: {
            id: true,
            name: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            completed: true,
          },
          orderBy: [
            {
              createdAt: 'desc',
            },
          ],
        },
        assignedModules: {
          select: {
            id: true,
            name: true,
            completed: true,
          },
          orderBy: [
            {
              createdAt: 'desc',
            },
          ],
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            completed: true,
          },
          orderBy: [
            {
              createdAt: 'desc',
            },
          ],
        },
        workSessions: {
          select: {
            id: true,
            start: true,
            end: true,
            durationMinutes: true,
            summary: true,
            progress: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
            module: {
              select: {
                id: true,
                name: true,
              },
            },
            Task: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: [
            {
              end: 'desc',
            },
          ],
        },
      },
    });

    return {
      message: 'Successfully fetched user details',
      data: user,
    };
  }
}
