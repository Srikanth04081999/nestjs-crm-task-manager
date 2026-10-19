import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Role } from '../common/enums/role.enum.js';
import { Task } from '../tasks/task.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash!: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role!: Role;

  @OneToMany(() => Task, (task) => task.assignedTo)
  tasks!: Relation<Task[]>;

  @CreateDateColumn()
  createdAt!: Date;
}