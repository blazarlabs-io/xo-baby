import { IsString, IsNumber } from 'class-validator';

export class CreateMeasurementRecordDto {
  @IsString()
  date: string;    // ISO string, e.g. "2025-06-26"

  @IsNumber()
  value: number;   // e.g. 5.5 (kg, cm, etc)
}
