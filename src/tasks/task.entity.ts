import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { TaskStatus } from '../common/enums/task-status.enum.js';
import { Customer } from '../customers/customer.entity.js';
import { User } from '../users/user.entity.js';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @Column({ type: 'datetime' })
  dueDate!: Date;

  @Column({ type: 'int' })
  assignedToId!: number;

  @ManyToOne(() => User, (user) => user.tasks, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo!: Relation<User>;

  @Column({ type: 'int' })
  customerId!: number;

  @ManyToOne(() => Customer, (customer) => customer.tasks, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customerId' })
  customer!: Relation<Customer>;

  @Column({ type: 'int' })
  createdById!: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'createdById' })
  createdBy!: Relation<User>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}