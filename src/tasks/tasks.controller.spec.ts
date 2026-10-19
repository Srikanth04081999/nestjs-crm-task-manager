import type { AuthRequest } from '../common/auth-request.js';
import { Role } from '../common/enums/role.enum.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';

describe('TasksController', () => {
  it('passes the authenticated user into the task query', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    const controller = new TasksController(
      service as unknown as TasksService,
    );

    const actor = {
      id: 2,
      role: Role.USER,
    };

    const request = { user: actor } as AuthRequest;
    const filters = { title: 'meeting' };

    await expect(
      controller.findAll(filters, request),
    ).resolves.toEqual([]);

    expect(service.findAll).toHaveBeenCalledWith(filters, actor);
  });
});