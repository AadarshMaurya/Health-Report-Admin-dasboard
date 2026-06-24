import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@clinitech.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'AdminPassword123', description: 'User account password' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
