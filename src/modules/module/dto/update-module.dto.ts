import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ModuleType, Priority } from '../../../../generated/prisma';

export class UpdateModuleDto {
  @ApiPropertyOptional({
    example: 'Authentication Module',
    description: 'Module name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'User authentication and authorization',
    description: 'Module description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: ModuleType,
    example: ModuleType.FRONTEND,
    description: 'Type of module',
  })
  @IsEnum(ModuleType)
  @IsOptional()
  type?: ModuleType;

  @ApiPropertyOptional({
    enum: Priority,
    example: Priority.MEDIUM,
    description: 'Priority level',
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

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
}
