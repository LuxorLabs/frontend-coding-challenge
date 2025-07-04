import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNotEmpty, IsEmail, MinLength} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({example: 'john@example.com', description: 'User email address'})
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({example: 'password123', description: 'User password'})
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({example: 'John Doe', description: 'User full name'})
  @IsString()
  @IsNotEmpty()
  name: string;
}
