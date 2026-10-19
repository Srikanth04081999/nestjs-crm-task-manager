import { CustomersController } from './customers.controller.js';
import { CustomersService } from './customers.service.js';

describe('CustomersController', () => {
  it('passes customer data to the service', async () => {
    const dto = {
      name: 'Raj',
      email: 'raj@example.com',
      company: 'Raj Enterprises',
      contact: '9876543210',
    };

    const service = {
      create: jest.fn().mockResolvedValue({ id: 1, ...dto }),
    };

    const controller = new CustomersController(
      service as unknown as CustomersService,
    );

    await expect(controller.create(dto)).resolves.toEqual({
      id: 1,
      ...dto,
    });

    expect(service.create).toHaveBeenCalledWith(dto);
  });
});