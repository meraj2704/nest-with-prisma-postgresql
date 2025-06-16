import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ModuleType, Priority } from 'generated/prisma';

export class UpdateModuleDto {
  @ApiPropertyOptional({
    example: 'Updated Authentication Module',
    description: 'Module name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated description',
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
    example: Priority.HIGH,
    description: 'Priority level',
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    example: 45,
    description: 'Estimated build time in hours',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  buildTime?: number;

  @ApiPropertyOptional({ example: 12, description: 'Buffer time in hours' })
  @IsInt()
  @IsPositive()
  @IsOptional()
  bufferTime?: number;

  @ApiPropertyOptional({
    example: '2023-06-05T00:00:00Z',
    description: 'Module start date',
  })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    example: '2023-07-20T00:00:00Z',
    description: 'Module end date',
  })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ example: 55.5, description: 'Total estimated hours' })
  @IsPositive()
  @IsOptional()
  estimatedHours?: number;
}
