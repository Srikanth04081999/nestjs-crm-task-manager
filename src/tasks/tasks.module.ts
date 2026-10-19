import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../customers/customers.module.js';
import { UsersModule } from '../users/users.module.js';
import { Task } from './task.entity.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    UsersModule,
    CustomersModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}