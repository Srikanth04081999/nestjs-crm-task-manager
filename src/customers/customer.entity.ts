import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Task } from '../tasks/task.entity.js';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 150 })
  company!: string;

  @Column({ type: 'varchar', length: 30 })
  contact!: string;

  @OneToMany(() => Task, (task: Task) => task.customer)
tasks!: Relation<Task[]>;
}