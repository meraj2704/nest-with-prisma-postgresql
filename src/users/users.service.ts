import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService, // Assuming PrismaService is injected for database operations
  ) {}

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
    await this.prisma.user.delete({
      where: { id: id },
    });
    return {
      message: 'User removed successfully',
    };
  }
}
