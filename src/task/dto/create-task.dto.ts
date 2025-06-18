import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Priority, TaskType } from 'generated/prisma';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Implement user authentication',
    description: 'Task title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Setup JWT and refresh tokens',
    description: 'Task description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: TaskType,
    example: TaskType.FEATURE,
    description: `Task type: ${Object.values(TaskType).join(', ')}`,
  })
  @IsEnum(TaskType)
  @IsNotEmpty()
  type: TaskType;

  @ApiProperty({
    enum: Priority,
    example: Priority.MEDIUM,
    description: `Priority level: ${Object.values(Priority).join(', ')}`,
  })
  @IsEnum(Priority)
  @IsNotEmpty()
  priority: Priority;

  @ApiPropertyOptional({
    example: '2023-12-31T00:00:00Z',
    description: 'Due date',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @ApiPropertyOptional({
    example: 8.5,
    description: 'Estimated hours to complete',
  })
  @IsPositive()
  @IsOptional()
  estimatedHours?: number;

  @ApiProperty({ example: 1, description: 'Module ID' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  moduleId: number;

  @ApiProperty({ example: 1, description: 'Assigned user ID' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  assignedUserId: number;
}
