import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { TaskStatus } from '../../common/enums/task-status.enum.js';

export class CreateTaskDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @IsDateString()
  dueDate!: string;

  @IsInt()
  @Min(1)
  assignedToId!: number;

  @IsInt()
  @Min(1)
  customerId!: number;
}

export class UpdateTaskDto extends PartialType(
  CreateTaskDto,
  { skipNullProperties: false },
) {}

export class FilterTasksDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(200)
  title?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  customerId?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assignedToId?: number;
}