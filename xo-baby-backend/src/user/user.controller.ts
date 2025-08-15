import { Body, Controller, Post, Get, Param, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { Headers, UnauthorizedException } from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
}
