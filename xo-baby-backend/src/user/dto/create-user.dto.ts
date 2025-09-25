import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export enum UserRole {
  PARENT = 'parent',
  MEDICAL = 'medical',
  ADMIN = 'admin'
}

export class CreateUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
