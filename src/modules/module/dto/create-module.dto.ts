import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ModuleType, Priority } from '../../../../generated/prisma';

export class CreateModuleDto {
  @ApiProperty({ example: 'Authentication Module', description: 'Module name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'User authentication and authorization',
    description: 'Module description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: ModuleType,
    example: ModuleType.FRONTEND,
    description: 'Type of module',
  })
  @IsEnum(ModuleType)
  @IsNotEmpty()
  type: ModuleType;

  @ApiProperty({
    enum: Priority,
    example: Priority.MEDIUM,
    description: 'Priority level',
  })
  @IsEnum(Priority)
  @IsNotEmpty()
  priority: Priority;

  @ApiPropertyOptional({
    example: 40,
    description: 'Estimated build time in hours',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  buildTime?: number;

  @ApiPropertyOptional({ example: 10, description: 'Buffer time in hours' })
  @IsInt()
  @IsPositive()
  @IsOptional()
  bufferTime?: number;

  @ApiPropertyOptional({
    example: '2023-06-01T00:00:00Z',
    description: 'Module start date',
  })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    example: '2023-07-15T00:00:00Z',
    description: 'Module end date',
  })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ example: 50.5, description: 'Total estimated hours' })
  @IsPositive()
  @IsOptional()
  estimatedHours?: number;

  @ApiProperty({ example: 1, description: 'Project ID this module belongs to' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  projectId: number;

  @ApiPropertyOptional({
    example: [101, 202],
    description: 'Array of developer IDs to assign to this module',
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  assignedDeveloperIds?: number[];

  @ApiPropertyOptional({
    example: 1,
    description: 'Department Id',
  })
  @IsNotEmpty({ message: 'Department Id is required' })
  departmentId: number;
}
