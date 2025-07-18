import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Priority, TaskType } from '../../../../generated/prisma';
export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Update authentication flow',
    description: 'Task title',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'Add 2FA support',
    description: 'Task description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: TaskType,
    example: TaskType.FEATURE,
    description: `Task type: ${Object.values(TaskType).join(', ')}`,
  })
  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @ApiPropertyOptional({
    enum: Priority,
    example: Priority.HIGH,
    description: `Priority level: ${Object.values(Priority).join(', ')}`,
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    example: '2024-01-15T00:00:00Z',
    description: 'Due date',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @ApiPropertyOptional({
    example: 10.0,
    description: 'Estimated hours to complete',
  })
  @IsPositive()
  @IsOptional()
  estimatedHours?: number;

  @ApiPropertyOptional({ example: true, description: 'Completion status' })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional({ example: 2, description: 'New assigned user ID' })
  @IsInt()
  @IsPositive()
  @IsOptional()
  assignedUserId?: number;
}
