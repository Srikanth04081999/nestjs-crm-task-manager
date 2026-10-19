import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { AuthRequest } from '../common/auth-request.js';
import {
  CreateTaskDto,
  FilterTasksDto,
  UpdateTaskDto,
} from './dto/task.dto.js';
import { TasksService } from './tasks.service.js';

@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get()
  findAll(
    @Query() query: FilterTasksDto,
    @Req() request: AuthRequest,
  ) {
    return this.service.findAll(query, request.user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthRequest,
  ) {
    return this.service.findOne(id, request.user);
  }

  @Post()
  create(
    @Body() dto: CreateTaskDto,
    @Req() request: AuthRequest,
  ) {
    return this.service.create(dto, request.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @Req() request: AuthRequest,
  ) {
    return this.service.update(id, dto, request.user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthRequest,
  ) {
    return this.service.remove(id, request.user);
  }
}