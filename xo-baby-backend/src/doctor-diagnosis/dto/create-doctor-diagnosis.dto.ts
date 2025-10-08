import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateDoctorDiagnosisDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsNotEmpty()
  @IsString()
  doctorName: string;

  @IsNotEmpty()
  @IsString()
  diagnosis: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNotEmpty()
  @IsString()
  kidId: string;
}

