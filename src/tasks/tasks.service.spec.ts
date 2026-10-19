import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum.js';
import { TaskStatus } from '../common/enums/task-status.enum.js';
import { CustomersService } from '../customers/customers.service.js';
import { User } from '../users/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { Task } from './task.entity.js';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  let service: TasksService;

  const query = {
    leftJoinAndSelect: jest.fn(),
    andWhere: jest.fn(),
    orderBy: jest.fn(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };

  const repository = {
    createQueryBuilder: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const users = {
    findOne: jest.fn(),
  };

  const customers = {
    findOne: jest.fn(),
  };

  const actor = {
    id: 2,
    role: Role.USER,
  } as User;

  beforeEach(() => {
    jest.resetAllMocks();

    query.leftJoinAndSelect.mockReturnValue(query);
    query.andWhere.mockReturnValue(query);
    query.orderBy.mockReturnValue(query);
    query.getMany.mockResolvedValue([]);

    repository.createQueryBuilder.mockReturnValue(query);

    service = new TasksService(
      repository as unknown as Repository<Task>,
      users as unknown as UsersService,
      customers as unknown as CustomersService,
    );
  });

  it('restricts regular-user lists to assigned tasks', async () => {
    await service.findAll({}, actor);

    expect(query.andWhere).toHaveBeenCalledWith(
      'task.assignedToId = :actorId',
      { actorId: actor.id },
    );
  });

  it('does not add an ownership restriction for admins', async () => {
    await service.findAll({}, {
      id: 1,
      role: Role.ADMIN,
    } as User);

    expect(query.andWhere).not.toHaveBeenCalled();
  });

  it('rejects assignment to another user', async () => {
    await expect(
      service.create(
        {
          title: 'Meeting',
          description: 'Discuss proposal',
          status: TaskStatus.TODO,
          dueDate: '2030-01-01T10:00:00.000Z',
          assignedToId: 3,
          customerId: 1,
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('does not delete a task outside the user scope', async () => {
    query.getOne.mockResolvedValue(null);

    await expect(service.remove(99, actor))
      .rejects.toBeInstanceOf(NotFoundException);

    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('applies filters without removing the ownership condition', async () => {
    await service.findAll(
      {
        status: TaskStatus.DONE,
        title: 'meeting',
        customerId: 1,
      },
      actor,
    );

    expect(query.andWhere).toHaveBeenCalledWith(
      'task.assignedToId = :actorId',
      { actorId: 2 },
    );

    expect(query.andWhere).toHaveBeenCalledWith(
      'task.status = :status',
      { status: TaskStatus.DONE },
    );

    expect(query.andWhere).toHaveBeenCalledWith(
      'task.title LIKE :title',
      { title: '%meeting%' },
    );

    expect(query.andWhere).toHaveBeenCalledWith(
      'task.customerId = :customerId',
      { customerId: 1 },
    );
  });
});