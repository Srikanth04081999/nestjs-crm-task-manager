import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { Customer } from './customer.entity.js';
import { CustomersService } from './customers.service.js';

describe('CustomersService', () => {
  const repository = {
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  let service: CustomersService;

  beforeEach(() => {
    jest.resetAllMocks();

    service = new CustomersService(
      repository as unknown as Repository<Customer>,
    );
  });

  it('returns 404 for an unknown customer', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(999))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects deletion when tasks reference the customer', async () => {
    repository.findOneBy.mockResolvedValue({
      id: 1,
      name: 'Raj',
    });

    const driverError = Object.assign(new Error('Referenced row'), {
      code: 'ER_ROW_IS_REFERENCED_2',
    });

    repository.delete.mockRejectedValue(
      new QueryFailedError('DELETE FROM customers', [], driverError),
    );

    await expect(service.remove(1))
      .rejects.toBeInstanceOf(ConflictException);
  });
});