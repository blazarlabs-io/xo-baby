import { IsEnum } from 'class-validator';
import { UserRole } from './create-user.dto';

export class UpdateRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
} 