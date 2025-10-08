import { IsString, IsOptional, IsNumberString } from 'class-validator';

export class GetVaccinationDto {
  @IsOptional()
  @IsString()
  kidId?: string;

  @IsOptional()
  @IsNumberString()
  limit?: number;
}

