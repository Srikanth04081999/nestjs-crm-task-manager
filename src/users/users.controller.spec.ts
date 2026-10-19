import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  it('returns users supplied by the service', async () => {
    const expected = [{ id: 1, name: 'Raj' }];

    const service = {
      findAll: jest.fn().mockResolvedValue(expected),
    };

    const controller = new UsersController(
      service as unknown as UsersService,
    );

    await expect(controller.findAll()).resolves.toEqual(expected);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });
});