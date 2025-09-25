import { Body, Controller, Post, Get, Put, Param, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserService } from './user.service';
import { Headers, UnauthorizedException } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Post('verify-token')
  async verifyToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const idToken = authHeader.replace('Bearer ', '');
    return this.userService.verifyIdToken(idToken);
  }

  @UseGuards(FirebaseAuthGuard)
  @Put(':uid/role')
  async updateRole(@Param('uid') uid: string, @Body() dto: UpdateRoleDto) {
    return this.userService.updateUserRole(uid, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get(':uid/profile')
  async getProfile(@Param('uid') uid: string) {
    return this.userService.getUserProfile(uid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('medical-personnel')
  async getMedicalPersonnel() {
    return this.userService.getAllMedicalPersonnel();
  }
}