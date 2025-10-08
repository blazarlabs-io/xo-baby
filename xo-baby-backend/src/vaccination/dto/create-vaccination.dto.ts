import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateVaccinationDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsNotEmpty()
  @IsString()
  vaccineName: string;

  @IsOptional()
  @IsString()
  doseNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  administeredBy?: string;

  @IsNotEmpty()
  @IsString()
  kidId: string;
}

