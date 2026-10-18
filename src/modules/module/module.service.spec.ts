import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { ModuleType, Priority } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { Validator } from '../../common/validation/validator.service.js';
import { ModuleRepository } from './module.repository.js';
import { ModuleService } from './module.service.js';

describe('ModuleService', () => {
  let service: ModuleService;
  const tx = { tx: true };
  let repository: Record<string, jest.Mock<(...args: any[]) => any>>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(async (data) => ({ id: 1, ...(data as object) })),
      addProjectMembers: jest.fn(),
      findDetails: jest.fn(),
      transaction: jest.fn(async (fn: any) => fn(tx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleService,
        { provide: ModuleRepository, useValue: repository },
        {
          provide: Validator,
          useValue: {
            validateProjectExists: jest.fn(async () => ({})),
            validateUsersExist: jest.fn(async () => true),
          },
        },
      ],
    }).compile();

    service = module.get(ModuleService);
  });

  const dto = {
    name: 'Auth',
    type: ModuleType.BACKEND,
    priority: Priority.MEDIUM,
    projectId: 10,
    departmentId: 1,
  };

  it('creates a module without developers and skips the member update', async () => {
    await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        assignedDevelopers: { connect: [] },
      }),
      tx,
    );
    expect(repository.addProjectMembers).not.toHaveBeenCalled();
  });

  it('adds assigned developers to the project in the same transaction', async () => {
    await service.create({ ...dto, assignedDeveloperIds: [3, 4] });

    expect(repository.addProjectMembers).toHaveBeenCalledWith(10, [3, 4], tx);
  });

  it('findOne returns 404 for an unknown module', async () => {
    repository.findDetails.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
