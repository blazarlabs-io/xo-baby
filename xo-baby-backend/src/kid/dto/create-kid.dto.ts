import { IsNotEmpty, IsString, IsDateString, IsOptional, IsArray } from 'class-validator';

export class CreateKidDto {
  @IsNotEmpty() @IsString()
  firstName: string;

  @IsNotEmpty() @IsString()
  lastName: string;

  @IsNotEmpty() @IsDateString()
  birthDate: string;

  @IsNotEmpty() @IsString()
  gender: string;

  @IsNotEmpty() @IsString()
  bloodType: string;

  @IsOptional() @IsString()
  ethnicity?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsArray()
  congenitalAnomalies?: { name: string; description?: string }[];

  @IsOptional() @IsString()
  avatarUrl?: string;

  @IsNotEmpty() @IsString()
  parentId: string;
}
