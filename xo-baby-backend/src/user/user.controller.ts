import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { Headers, UnauthorizedException } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly firebase: FirebaseService,
  ) {}

  @Post('create')
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  // @Post('decrypt-data')
  // async decryptUserData(@Body() body: { ipfsHash: string; aesKey: string }) {
  //   if (!body.ipfsHash || !body.aesKey) {
  //     throw new UnauthorizedException('Missing IPFS hash or AES key');
  //   }
  //   return this.userService.retrieveAndDecryptFromIPFS(
  //     body.ipfsHash,
  //     body.aesKey,
  //   );
  // }

  @Post('verify-token')
  async verifyToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const idToken = authHeader.replace('Bearer ', '');
    return this.userService.verifyIdToken(idToken);
  }

  @Get('user-role/:uid')
  @UseGuards(FirebaseAuthGuard)
  async getUserRole(
    @Param('uid') uid: string,
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const idToken = authHeader.replace('Bearer ', '');
    return this.userService.getUserRole(uid, idToken);
  }

  @Post('update-role/:uid')
  async updateUserRole(
    @Param('uid') uid: string,
    @Body() body: { role: string },
  ) {
    return this.userService.updateUserRole(uid, body.role);
  }

  @Get('test-role/:uid')
  async testGetUserRole(@Param('uid') uid: string) {
    // This is a test endpoint without authentication for debugging
    try {
      const userDoc = await this.firebase
        .getFirestore()
        .collection('users')
        .doc(uid)
        .get();

      if (!userDoc.exists) {
        return { error: 'User not found', uid };
      }

      const userData = userDoc.data();
      return {
        success: true,
        uid,
        role: userData?.role || 'parent',
        userData,
      };
    } catch (error) {
      return { error: error.message, uid };
    }
  }
}
