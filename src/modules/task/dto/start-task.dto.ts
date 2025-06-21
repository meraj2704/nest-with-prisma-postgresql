import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class StartTaskDto {
  @ApiProperty({ description: 'Task ID' })
  @IsInt()
  @IsPositive()
  taskId: number;
}
