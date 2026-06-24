import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';

export class CreateAccountDto {
  @ApiProperty({ example: 'newuser@example.com', description: 'Account email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123', description: 'Account password' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: UserRole.USER, enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  // Optional Client profile details (required if role is USER)
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  fullName?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  mobile?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsOptional()
  state?: string;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;

  @ApiProperty({ example: 'Male', required: false })
  @IsOptional()
  gender?: string;

  @ApiProperty({ example: 'Engineer', required: false })
  @IsOptional()
  occupation?: string;

  @ApiProperty({ example: 'None', required: false })
  @IsOptional()
  healthCondition?: string;

  @ApiProperty({ example: 'Skin care', required: false })
  @IsOptional()
  beautyGoal?: string;
}
