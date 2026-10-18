import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

/** Public user columns — never includes the password hash. */
const userPublicSelect = {
  id: true,
  username: true,
  fullName: true,
  phone: true,
  role: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findAll() {
    return this.prisma.user.findMany({ select: userPublicSelect });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findPublicById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: userPublicSelect,
    });
  }

  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async findTeamMembers(departmentId: number) {
    return this.prisma.user.findMany({
      where: { departmentId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        projects: { select: { id: true, name: true } },
        workSessions: { select: { id: true, durationMinutes: true } },
        assignedTasks: { select: { id: true, completed: true } },
        assignedModules: { select: { id: true, completed: true } },
      },
    });
  }

  async findAssignedProjects(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { projects: { select: { id: true, name: true } } },
    });
  }

  async findAssignedModules(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { assignedModules: { select: { id: true, name: true } } },
    });
  }

  async findDetails(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        Department: { select: { id: true, name: true } },
        projects: {
          select: { id: true, name: true, completed: true },
          orderBy: [{ createdAt: 'desc' }],
        },
        assignedModules: {
          select: { id: true, name: true, completed: true },
          orderBy: [{ createdAt: 'desc' }],
        },
        assignedTasks: {
          select: { id: true, title: true, completed: true },
          orderBy: [{ createdAt: 'desc' }],
        },
        workSessions: {
          select: {
            id: true,
            start: true,
            end: true,
            durationMinutes: true,
            summary: true,
            progress: true,
            project: { select: { id: true, name: true } },
            module: { select: { id: true, name: true } },
            Task: { select: { id: true, title: true } },
          },
          orderBy: [{ end: 'desc' }],
        },
      },
    });
  }
}
