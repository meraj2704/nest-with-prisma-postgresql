import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Priority, ProjectType } from '../../../../generated/prisma';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Project Name',
    description: 'Name of the project',
  })
  @IsString()
  @IsNotEmpty({ message: 'Project name cannot be empty' })
  name: string;

  @ApiProperty({
    example: 'Project Description',
    description: 'Detailed description of the project',
  })
  @IsString()
  @IsNotEmpty({ message: 'Project description cannot be empty' })
  description: string;

  @ApiProperty({
    enum: ProjectType,
    example: ProjectType.FRONTEND,
    description: `Project type must be one of: ${Object.values(ProjectType).join(', ')}`,
  })
  @IsEnum(ProjectType, {
    message: `Invalid project type '$value'. Valid values are: ${Object.values(ProjectType).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Project type cannot be empty' })
  type: ProjectType;

  @ApiProperty({
    enum: Priority,
    example: Priority.HIGH,
    description: `Priority must be one of: ${Object.values(Priority).join(', ')}`,
  })
  @IsEnum(Priority, {
    message: `Invalid priority '$value'. Valid values are: ${Object.values(Priority).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Priority cannot be empty' })
  priority: Priority;

  @ApiPropertyOptional({
    example: '2023-12-31',
    description:
      'Due date (YYYY-MM-DD, MM/DD/YYYY, or other common date formats)',
  })
  @IsDate({ message: 'dueDate must be a valid date' })
  @Type(() => Date)
  dueDate: Date;

  @ApiPropertyOptional({
    example: 1,
    description: 'Department Id',
  })
  @IsNotEmpty({ message: 'Department Id is required' })
  departmentId: number;
}
