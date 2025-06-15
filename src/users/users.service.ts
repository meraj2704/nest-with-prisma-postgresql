import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService, // Assuming PrismaService is injected for database operations
  ) {}

  async findAll() {
    const users = await this.prisma.users.findMany({
      select: {
        user_id: true,
        username: true,
        full_name: true,
        phone: true,
        role: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
    });
    return {
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        username: true,
        full_name: true,
        phone: true,
        role: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
    });
    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.users.update({
      where: { user_id: id },
      data: updateUserDto,
    });
    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  async remove(id: number) {
    await this.prisma.users.delete({
      where: { user_id: id },
    });
    return {
      message: 'User removed successfully',
    };
  }
}
