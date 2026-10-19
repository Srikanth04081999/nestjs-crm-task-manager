import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
} from './dto/customer.dto.js';
import { Customer } from './customer.entity.js';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repository: Repository<Customer>,
  ) {}

  findAll() {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const customer = await this.repository.findOneBy({ id });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  create(dto: CreateCustomerDto) {
    return this.repository.save(this.repository.create(dto));
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    this.repository.merge(customer, dto);
    return this.repository.save(customer);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.repository.delete(id);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code ===
          'ER_ROW_IS_REFERENCED_2'
      ) {
        throw new ConflictException(
          'Delete or relink customer tasks first',
        );
      }

      throw error;
    }

    return { message: 'Customer deleted' };
  }
}