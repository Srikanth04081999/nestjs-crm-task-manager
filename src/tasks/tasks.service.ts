import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum.js';
import { CustomersService } from '../customers/customers.service.js';
import { User } from '../users/user.entity.js';
import { UsersService } from '../users/users.service.js';
import {
  CreateTaskDto,
  FilterTasksDto,
  UpdateTaskDto,
} from './dto/task.dto.js';
import { Task } from './task.entity.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
  ) {}

  private scopedQuery(actor: User) {
    const query = this.repository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.customer', 'customer');

    if (actor.role !== Role.ADMIN) {
      query.andWhere('task.assignedToId = :actorId', {
        actorId: actor.id,
      });
    }

    return query;
  }

  async findAll(filters: FilterTasksDto, actor: User) {
    const query = this.scopedQuery(actor);

    if (filters.status) {
      query.andWhere('task.status = :status', {
        status: filters.status,
      });
    }

    if (filters.title) {
      query.andWhere('task.title LIKE :title', {
        title: `%${filters.title}%`,
      });
    }

    if (filters.customerId !== undefined) {
      query.andWhere('task.customerId = :customerId', {
        customerId: filters.customerId,
      });
    }

    if (filters.assignedToId !== undefined) {
      if (actor.role !== Role.ADMIN) {
        throw new ForbiddenException('Admin filter only');
      }

      query.andWhere('task.assignedToId = :assignedToId', {
        assignedToId: filters.assignedToId,
      });
    }

    return query.orderBy('task.id', 'DESC').getMany();
  }

  async findOne(id: number, actor: User): Promise<Task> {
    const task = await this.scopedQuery(actor)
      .andWhere('task.id = :id', { id })
      .getOne();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(dto: CreateTaskDto, actor: User) {
    this.checkAssignment(dto.assignedToId, actor);

    await this.usersService.findOne(dto.assignedToId);
    await this.customersService.findOne(dto.customerId);

    const task = this.repository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      dueDate: new Date(dto.dueDate),
      assignedToId: dto.assignedToId,
      customerId: dto.customerId,
      createdById: actor.id,
    });

    const saved = await this.repository.save(task);
    return this.findOne(saved.id, actor);
  }

  async update(id: number, dto: UpdateTaskDto, actor: User) {
    const task = await this.findOne(id, actor);

    if (dto.assignedToId !== undefined) {
      this.checkAssignment(dto.assignedToId, actor);
      await this.usersService.findOne(dto.assignedToId);
    }

    if (dto.customerId !== undefined) {
      await this.customersService.findOne(dto.customerId);
    }

    // Update scalar fields explicitly to avoid stale loaded relations.
    await this.repository.update(id, {
      title: dto.title ?? task.title,
      description: dto.description ?? task.description,
      status: dto.status ?? task.status,
      dueDate:
        dto.dueDate !== undefined
          ? new Date(dto.dueDate)
          : task.dueDate,
      assignedToId: dto.assignedToId ?? task.assignedToId,
      customerId: dto.customerId ?? task.customerId,
    });

    return this.findOne(id, actor);
  }

  async remove(id: number, actor: User) {
    await this.findOne(id, actor);
    await this.repository.delete(id);

    return { message: 'Task deleted' };
  }

  private checkAssignment(assignedToId: number, actor: User) {
    if (actor.role !== Role.ADMIN && assignedToId !== actor.id) {
      throw new ForbiddenException(
        'Users can only assign tasks to themselves',
      );
    }
  }
}