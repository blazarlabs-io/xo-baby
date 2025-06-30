import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTasksDto {
  @IsOptional()
  @IsString()
  kidId?: string;

  @IsNumber()
  @Type(() => Number)
  limit: number;
}