import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateUserDto {
  @ApiProperty({ example: 'username123' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Meraj Hossain' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: 'meraj@gmail.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '01684088348' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'meraj123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
