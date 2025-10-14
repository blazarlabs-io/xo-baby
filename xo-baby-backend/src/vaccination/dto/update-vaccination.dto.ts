import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateVaccinationDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  vaccineName?: string;

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
}

