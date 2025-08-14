import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  dateOfBirth?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  bloodType?: string;

  @IsOptional()
  allergies?: string;

  @IsOptional()
  medications?: string;

  @IsOptional()
  emergencyContactName?: string;

  @IsOptional()
  emergencyContactPhone?: string;

  @IsOptional()
  language?: string;

  @IsOptional()
  notifications?: string;

  @IsOptional()
  customNotes?: string;
}
