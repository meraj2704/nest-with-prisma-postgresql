import { jest } from '@jest/globals';
import { NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from '../../common/services/progress.service.js';
import { Validator } from '../../common/validation/validator.service.js';
import { TaskRepository } from './task.repository.js';
import { TaskService } from './task.service.js';

describe('TaskService', () => {
  let service: TaskService;
  const tx = { tx: true };
  let repository: Record<string, jest.Mock<(...args: any[]) => any>>;
  let progress: Record<string, jest.Mock<(...args: any[]) => any>>;
  let validator: Validator;

  const inProgressTask = {
    id: 7,
    status: 'IN_PROGRESS',
    completed: false,
    startedAt: new Date(Date.now() - 90 * 60_000),
    projectId: 1,
    moduleId: 2,
    departmentId: 3,
    assignedUserId: null,
  };

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      update: jest.fn(async (_id, data) => data),
      remove: jest.fn(),
      createWorkSession: jest.fn(async (data) => data),
      findAllWithRelations: jest.fn(),
      transaction: jest.fn(async (fn: any) => fn(tx)),
    };
    progress = {
      updateModuleProgress: jest.fn(),
      updateProjectProgress: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: TaskRepository, useValue: repository },
        { provide: ProgressService, useValue: progress },
        { provide: Validator, useValue: new Validator({} as never) },
      ],
    }).compile();

    service = module.get(TaskService);
    validator = module.get(Validator);
  });

  describe('endTask', () => {
    it('logs the session for the calling user and converts minutes to hours', async () => {
      repository.findById.mockResolvedValue(inProgressTask);

      const result = await service.endTask(
        7,
        { progress: 50, summary: 'work' },
        42,
      );

      expect(repository.createWorkSession).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 42, durationMinutes: 90 }),
        tx,
      );
      expect(repository.update).toHaveBeenCalledWith(
        7,
        expect.objectContaining({
          status: 'TODO',
          totalWorkHours: { increment: 1.5 },
        }),
        tx,
      );
      expect(result.message).toBe('Task successfully ended');
    });

    it('runs every write, including progress roll-up, on the transaction client', async () => {
      repository.findById.mockResolvedValue(inProgressTask);

      await service.endTask(7, { progress: 100, summary: 'done' }, 42);

      expect(repository.findById).toHaveBeenCalledWith(7, tx);
      expect(progress.updateModuleProgress).toHaveBeenCalledWith(2, tx);
      expect(progress.updateProjectProgress).toHaveBeenCalledWith(1, tx);
      expect(repository.update).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ status: 'DONE', completed: true }),
        tx,
      );
    });

    it('rejects a task that is not in progress', async () => {
      repository.findById.mockResolvedValue({
        ...inProgressTask,
        status: 'TODO',
      });

      await expect(
        service.endTask(7, { progress: 10, summary: 'x' }, 42),
      ).rejects.toBeInstanceOf(PreconditionFailedException);
      expect(repository.createWorkSession).not.toHaveBeenCalled();
    });

    it('returns 404 for an unknown task', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(
        service.endTask(7, { progress: 10, summary: 'x' }, 42),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it('remove recalculates progress inside the same transaction', async () => {
    jest
      .spyOn(validator, 'validateTaskExists')
      .mockResolvedValue(inProgressTask as never);
    repository.remove.mockResolvedValue({ id: 7, moduleId: 2, projectId: 1 });

    await service.remove(7);

    expect(repository.remove).toHaveBeenCalledWith(7, tx);
    expect(progress.updateModuleProgress).toHaveBeenCalledWith(2, tx);
    expect(progress.updateProjectProgress).toHaveBeenCalledWith(1, tx);
  });

  it('findAll tolerates unassigned tasks', async () => {
    repository.findAllWithRelations.mockResolvedValue([
      {
        id: 1,
        project: { id: 1, name: 'P' },
        module: { id: 2, name: 'M' },
        assignedUser: null,
      },
    ]);

    const { data } = await service.findAll();

    expect(data[0]).toMatchObject({ assignedUser: null, assignedUserId: null });
  });
});
