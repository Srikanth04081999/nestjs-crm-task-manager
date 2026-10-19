import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum.js';
import { RegisterDto } from '../auth/dto/auth.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(dto: RegisterDto): Promise<User> {
    // bcrypt accepts at most 72 bytes without truncation.
    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new ConflictException('Password must not exceed 72 bytes');
    }

    const user = this.repository.create({
      name: dto.name,
      email: dto.email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, 12),
      role: Role.USER,
    });

    const saved = await this.save(user);
    return this.findOne(saved.id);
  }

  findAll(): Promise<User[]> {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.repository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  findForLogin(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', {
        email: email.trim().toLowerCase(),
      })
      .getOne();
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) {
      user.email = dto.email.trim().toLowerCase();
    }
    if (dto.role !== undefined) user.role = dto.role;

    await this.save(user);
    return this.findOne(id);
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
          'Delete or reassign related tasks before deleting this user',
        );
      }

      throw error;
    }

    return { message: 'User deleted' };
  }

  private async save(user: User): Promise<User> {
    try {
      return await this.repository.save(user);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }
}