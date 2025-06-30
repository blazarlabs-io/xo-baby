import { IsNumber, IsDateString } from 'class-validator';

export class UpdateKidWeightDto {
  @IsNumber()
  weight: number;

  @IsDateString()
  date: string;
}

export class UpdateKidHeightDto {
  @IsNumber()
  height: number;

  @IsDateString()
  date: string;
}
