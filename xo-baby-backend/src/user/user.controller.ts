import { Body, Controller, Post, Get, Put, Param, UseGuards, Delete } from '@nestjs/common';
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

  @Post('create-google')
  async createGoogle(@Body() data: {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }) {
    return this.userService.createGoogleUser(data);
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

  @UseGuards(FirebaseAuthGuard)
  @Put(':uid/disable')
  async disableUser(@Param('uid') uid: string, @Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    // Check if user has admin role
    const userProfile = await this.userService.getUserProfile(user.uid);
    if (userProfile.role !== 'admin') {
      throw new UnauthorizedException('Access denied: Admin role required to disable users');
    }

    return this.userService.disableUser(uid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete(':uid')
  async deleteUser(@Param('uid') uid: string, @Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    // Check if user has admin role
    const userProfile = await this.userService.getUserProfile(user.uid);
    if (userProfile.role !== 'admin') {
      throw new UnauthorizedException('Access denied: Admin role required to delete users');
    }

    return this.userService.deleteUser(uid);
  }
}