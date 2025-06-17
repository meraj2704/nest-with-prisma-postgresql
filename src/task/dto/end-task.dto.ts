import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class EndTaskDto {
  @ApiProperty({ description: 'Progress percentage (0-100)' })
  @IsInt()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({ description: 'Work summary notes' })
  @IsString()
  @IsNotEmpty()
  summary: string;
}
