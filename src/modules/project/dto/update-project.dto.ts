import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Priority, ProjectType } from '../../../../generated/prisma';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({
    example: 'Updated Project Name',
    description: 'Updated name of the project',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.name !== undefined)
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated project description',
    description: 'Updated detailed description of the project',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.description !== undefined)
  description?: string;

  @ApiPropertyOptional({
    enum: ProjectType,
    example: ProjectType.BACKEND,
    description: `Updated project type must be one of: ${Object.values(ProjectType).join(', ')}`,
  })
  @IsEnum(ProjectType, {
    message: `Invalid project type '$value'. Valid values are: ${Object.values(ProjectType).join(', ')}`,
  })
  @ValidateIf((o) => o.type !== undefined)
  type?: ProjectType;

  @ApiPropertyOptional({
    enum: Priority,
    example: Priority.MEDIUM,
    description: `Updated priority must be one of: ${Object.values(Priority).join(', ')}`,
  })
  @IsEnum(Priority, {
    message: `Invalid priority '$value'. Valid values are: ${Object.values(Priority).join(', ')}`,
  })
  @ValidateIf((o) => o.priority !== undefined)
  priority?: Priority;

  @ApiPropertyOptional({
    example: '2024-01-31',
    description:
      'Updated due date (YYYY-MM-DD, MM/DD/YYYY, or other common date formats)',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ValidateIf((o) => o.dueDate !== undefined)
  dueDate?: Date;
}
