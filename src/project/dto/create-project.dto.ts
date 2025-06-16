import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
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

  @ApiProperty({ enum: ProjectType, example: ProjectType.FRONTEND })
  @IsString()
  @IsNotEmpty()
  type: ProjectType;

  @ApiProperty({
    enum: Priority,
    example: Priority.HIGH,
    description: 'Project priority',
  })
  @IsString()
  @IsNotEmpty()
  priority: Priority;
}
