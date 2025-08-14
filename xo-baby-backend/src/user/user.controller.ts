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

  @Post('decrypt-data')
  async decryptUserData(@Body() body: { ipfsHash: string; aesKey: string }) {
    if (!body.ipfsHash || !body.aesKey) {
      throw new UnauthorizedException('Missing IPFS hash or AES key');
    }
    return this.userService.retrieveAndDecryptFromIPFS(
      body.ipfsHash,
      body.aesKey,
    );
  }

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

  /**
   * Process user data: encrypt and upload to IPFS
   * GET /users/:userId/process-data
   */
  @Get(':userId/process-data')
  async processUserData(@Param('userId') userId: string) {
    return this.userService.processUserDataToIPFS(userId);
  }

  /**
   * Retrieve and decrypt data from IPFS
   * GET /users/retrieve-data?hash=ipfsHash&key=aesKey
   */
  @Get('retrieve-data')
  async retrieveData(
    @Query('hash') ipfsHash: string,
    @Query('key') aesKey: string,
  ) {
    if (!ipfsHash || !aesKey) {
      throw new UnauthorizedException('Missing IPFS hash or AES key');
    }
    return this.userService.retrieveAndDecryptFromIPFS(ipfsHash, aesKey);
  }

  /**
   * Full demonstration of encryption and IPFS workflow
   * GET /users/:userId/demo
   */
  @Get(':userId/demo')
  async demonstrateWorkflow(@Param('userId') userId: string) {
    return this.userService.demonstrateEncryptionAndIPFS(userId);
  }

  /**
   * Test Pinata connection
   * GET /users/pinata/test
   */
  @Get('pinata/test')
  async testPinataConnection() {
    try {
      const isConnected = await this.userService.testPinataConnection();
      return {
        status: isConnected ? 'connected' : 'disconnected',
        message: isConnected
          ? 'Pinata connection successful'
          : 'Pinata connection failed - check your API credentials',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Pinata test failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
