import { Validator } from 'src/common/validation/validator.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ModuleService {
  constructor(
    private prisma: PrismaService,
    private validator: Validator,
  ) {}
  async create(createModuleDto: CreateModuleDto) {
    await this.validator.validateProjectExists(createModuleDto.projectId);
    await this.validator.validateUsersExist(
      createModuleDto.assignedDeveloperIds,
    );
    const { assignedDeveloperIds, ...otherData } = createModuleDto;
    const module = await this.prisma.module.create({
      data: {
        ...otherData,
        assignedDevelopers: {
          connect: assignedDeveloperIds?.map((id) => ({ id })) || [],
        },
      },
    });
    return {
      message: 'Module successfully created',
      data: module,
    };
  }

  async findAll() {
    const modules = await this.prisma.module.findMany();
    return {
      message: 'Modules found',
      data: modules,
    };
  }

  async findOne(id: number) {
    const module = await this.prisma.module.findUnique({ where: { id } });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return {
      message: 'Module found',
      data: module,
    };
  }
  async findByProjectId(id: number) {
    await this.validator.validateProjectExists(id);
    const modules = await this.prisma.module.findMany({
      where: { projectId: id },
    });
    return {
      message: 'Module found',
      data: modules,
    };
  }

  async update(id: number, updateModuleDto: UpdateModuleDto) {
    await this.validator.validateModuleExists(id);
    if (updateModuleDto.assignedDeveloperIds) {
      await this.validator.validateUsersExist(
        updateModuleDto.assignedDeveloperIds,
      );
    }
    return await this.prisma.module.update({
      where: { id },
      data: {
        name: updateModuleDto.name,
        description: updateModuleDto.description,
        type: updateModuleDto.type,
        priority: updateModuleDto.priority,
        buildTime: updateModuleDto.buildTime,
        bufferTime: updateModuleDto.bufferTime,
        startDate: updateModuleDto.startDate,
        endDate: updateModuleDto.endDate,
        estimatedHours: updateModuleDto.estimatedHours,
        assignedDevelopers: {
          connect:
            updateModuleDto.assignedDeveloperIds?.map((id) => ({ id })) || [],
        },
      },
    });
  }

  async remove(id: number) {
    const module = await this.prisma.module.delete({ where: { id } });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return {
      message: 'Module successfully deleted',
      data: module,
    };
  }
}
