import { IsString, IsOptional, IsNumberString } from 'class-validator';

export class GetDoctorDiagnosisDto {
  @IsOptional()
  @IsString()
  kidId?: string;

  @IsOptional()
  @IsNumberString()
  limit?: number;
}

