import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Priority, ProjectType } from 'generated/prisma';

export class CreateProjectDto {
  @ApiProperty({ example: 'Project Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Project Description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: ProjectType,
    example: ProjectType.FRONTEND,
    description: `Project type (${Object.values(ProjectType).join(', ')})`,
  })
  @IsEnum(ProjectType, {
    message: `Invalid project type. Valid values are: ${Object.values(ProjectType).join(', ')}`,
  })
  @IsNotEmpty()
  type: ProjectType;

  @ApiProperty({
    enum: Priority,
    example: Priority.HIGH,
    description: `Priority level (${Object.values(Priority).join(', ')})`,
  })
  @IsEnum(Priority, {
    message: `Invalid priority. Valid values are: ${Object.values(Priority).join(', ')}`,
  })
  @IsNotEmpty()
  priority: Priority;

  @ApiPropertyOptional({
    example: '2023-12-31T00:00:00Z',
    description: 'Due date',
  })
  @IsDateString()
  @IsOptional()
  dueDate: Date;
}
