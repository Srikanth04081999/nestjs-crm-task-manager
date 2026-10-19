import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum.js';
import { User } from './user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
  };

  let service: UsersService;

  beforeEach(() => {
    jest.resetAllMocks();

    service = new UsersService(
      repository as unknown as Repository<User>,
    );
  });

  it('hashes passwords and always registers a regular user', async () => {
    repository.create.mockImplementation((value) => value);
    repository.save.mockResolvedValue({ id: 1 });
    repository.findOneBy.mockResolvedValue({
      id: 1,
      name: 'Raj',
      email: 'raj@example.com',
      role: Role.USER,
    });

    const password = 'ExamplePassword123!';

    const result = await service.create({
      name: 'Raj',
      email: 'RAJ@example.com',
      password,
    });

    const saved = repository.save.mock.calls[0][0];

    expect(saved.passwordHash).not.toBe(password);
    expect(await bcrypt.compare(password, saved.passwordHash)).toBe(true);
    expect(saved.role).toBe(Role.USER);
    expect(saved.email).toBe('raj@example.com');
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('returns 404 for an unknown user', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(999))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('converts duplicate email errors into a conflict', async () => {
    repository.create.mockImplementation((value) => value);

    const driverError = Object.assign(new Error('Duplicate entry'), {
      code: 'ER_DUP_ENTRY',
    });

    repository.save.mockRejectedValue(
      new QueryFailedError('INSERT INTO users', [], driverError),
    );

    await expect(
      service.create({
        name: 'Raj',
        email: 'raj@example.com',
        password: 'ExamplePassword123!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});