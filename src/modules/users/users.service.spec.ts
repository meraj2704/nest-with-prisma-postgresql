import { jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Validator } from '../../common/validation/validator.service.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Record<string, jest.Mock<(...args: any[]) => any>>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      update: jest.fn(async (_id, data) => data),
      findByEmailOrUsername: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repository },
        {
          provide: Validator,
          useValue: { validateUserExist: jest.fn(async () => undefined) },
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('update maps full_name and hashes a new password', async () => {
    await service.update(5, { full_name: 'New Name', password: 'secret' });

    const [, data] = repository.update.mock.calls[0] as [number, any];
    expect(data.fullName).toBe('New Name');
    expect(data).not.toHaveProperty('full_name');
    expect(data.password).not.toBe('secret');
    await expect(bcrypt.compare('secret', data.password)).resolves.toBe(true);
  });

  it('update connects a new department instead of writing the raw id', async () => {
    await service.update(5, { departmentId: 2 });

    const [, data] = repository.update.mock.calls[0] as [number, any];
    expect(data).toEqual({ Department: { connect: { id: 2 } } });
  });

  it('create never returns the password hash', async () => {
    repository.findByEmailOrUsername.mockResolvedValue(null);
    repository.create.mockResolvedValue({
      id: 1,
      email: 'a@b.c',
      password: 'hash',
    });

    const result = await service.create({
      username: 'a',
      full_name: 'A',
      email: 'a@b.c',
      phone: '1',
      password: 'pw',
      departmentId: 1,
    });

    expect(result.data.user).not.toHaveProperty('password');
  });

  it('create rejects a duplicate email', async () => {
    repository.findByEmailOrUsername.mockResolvedValue({ email: 'a@b.c' });

    await expect(
      service.create({
        username: 'a',
        full_name: 'A',
        email: 'a@b.c',
        phone: '1',
        password: 'pw',
        departmentId: 1,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
