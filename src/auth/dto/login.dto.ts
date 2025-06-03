import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'meraj@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'meraj123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
