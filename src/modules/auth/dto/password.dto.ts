import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'meraj123',
    description: 'The current password of the user',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    example: 'meraj456',
    description: 'The new password of the user',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
