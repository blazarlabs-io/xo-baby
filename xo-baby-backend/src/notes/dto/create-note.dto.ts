import { IsDateString, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsIn([
    'Health & Wellness',
    'Feeding',
    'Sleep',
    'Milestones',
    'Diaper & Potty',
    'Emotions & Behavior',
  ])
  category: string;

  @IsNotEmpty()
  @IsString()
  kidId: string;
}