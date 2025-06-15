import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AllUserDto {
  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  id: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  email: string;

  @ApiProperty({ example: 'johndoe', description: 'The username of the user' })
  username: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  full_name: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'The phone number of the user',
    nullable: true,
  })
  phone: string;

  @ApiProperty({
    enum: ['MANAGER', 'TEAM_LEAD', 'DEVELOPER'],
    example: 'DEVELOPER',
    description: 'The role of the DEVELOPER',
  })
  role: string;

  @ApiProperty({
    example: '2023-05-15T10:00:00.000Z',
    description: 'The date when the user was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-16T11:30:00.000Z',
    description: 'The date when the user was last updated',
  })
  updatedAt: Date;

  @Exclude()
  @ApiProperty({
    example: 'secretpassword123',
    description: 'The password of the user (excluded from responses)',
    writeOnly: true,
  })
  password: string;

  constructor(partial: Partial<AllUserDto>) {
    Object.assign(this, partial);
  }
}

// Example Swagger response
export const UserResponseExample = {
  id: 1,
  email: 'user@example.com',
  username: 'johndoe',
  full_name: 'John Doe',
  phone: '+1234567890',
  role: 'DEVELOPER',
  createdAt: '2023-05-15T10:00:00.000Z',
  updatedAt: '2023-05-16T11:30:00.000Z',
};
