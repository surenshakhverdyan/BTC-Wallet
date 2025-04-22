import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { IsEqualTo } from '../../decorators/is-equal-to.decorator';

export class SignUpDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'password123',
    description: 'Confirm password',
  })
  @IsEqualTo('password')
  confirmPassword: string;
}
