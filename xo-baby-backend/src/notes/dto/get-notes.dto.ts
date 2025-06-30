import { IsOptional, IsIn, IsString } from 'class-validator';

export class GetNotesDto {
  @IsOptional()
  @IsString()
  kidId?: string;

  @IsOptional()
  @IsIn([
    'Health & Wellness',
    'Feeding',
    'Sleep',
    'Milestones',
    'Diaper & Potty',
    'Emotions & Behavior',
  ])
  category?: string;
}