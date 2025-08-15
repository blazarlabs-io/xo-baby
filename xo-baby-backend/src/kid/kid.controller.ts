import {
  Controller,
  Get,
  Param,
  Headers,
  UnauthorizedException,
  Post,
  Body,
} from '@nestjs/common';
import { KidService } from './kid.service';
import { UserService } from '../user/user.service';
import { CreateKidDto } from './dto/create-kid.dto';
import {
  UpdateKidHeightDto,
  UpdateKidWeightDto,
} from './dto/update-kid-vitals.dto';

@Controller('kid')
export class KidController {
  constructor(
    private readonly kidService: KidService,
    private readonly userService: UserService,
  ) {}

  @Post('create')
  async createKid(@Body() dto: CreateKidDto) {
    return this.kidService.createKid(dto);
  }

  @Get('my-kids')
  async getKidsByUser(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }
    const idToken = authHeader.replace('Bearer ', '');
    return this.kidService.getKidsByUserToken(idToken);
  }

  @Get(':id/weight')
  async getKidWeight(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    const kid = await this.kidService.findById(kidId);
    if (!kid || kid.parentId !== user.uid) {
      throw new UnauthorizedException(
        'Access denied: Not the parent of this kid',
      );
    }

    return {
      kidId: kid.id,
      weight: kid.vitals.weight || null,
      updatedAt: kid.createdAt,
    };
  }

  @Get(':id/height')
  async getKidHeight(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    const kid = await this.kidService.findById(kidId);
    if (!kid || kid.parentId !== user.uid) {
      throw new UnauthorizedException(
        'Access denied: Not the parent of this kid',
      );
    }

    return {
      kidId: kid.id,
      height: kid.vitals.height || null,
      updatedAt: kid.createdAt,
    };
  }

  @Get(':id/weight-history')
  async getWeightHistory(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    return this.kidService.getWeightHistory(kidId, user.uid);
  }

  @Get(':id/height-history')
  async getHeightHistory(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    return this.kidService.getHeightHistory(kidId, user.uid);
  }

  @Post(':id/weight')
  async updateKidWeight(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string,
    @Body() dto: UpdateKidWeightDto,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    return this.kidService.updateWeight(kidId, user.uid, dto.weight, dto.date);
  }

  @Post(':id/height')
  async updateKidHeight(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string,
    @Body() dto: UpdateKidHeightDto,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    return this.kidService.updateHeight(kidId, user.uid, dto.height, dto.date);
  }

  /**
   * Get decrypted kid data from IPFS
   */
  @Get(':id/decrypted')
  async getDecryptedKidData(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string,
    @Headers('x-aes-key') aesKey: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    if (!aesKey) {
      throw new UnauthorizedException('AES key is required for decryption');
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    // Verify user has access to this kid
    const kid = await this.kidService.findById(kidId);
    if (!kid || kid.parentId !== user.uid) {
      throw new UnauthorizedException(
        'Access denied: Not the parent of this kid',
      );
    }

    return this.kidService.getDecryptedKidData(kidId, aesKey);
  }

  /**
   * Get kid details with IPFS information
   */
  @Get(':id/details')
  async getKidDetails(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    // Verify user has access to this kid
    const kid = await this.kidService.findById(kidId);
    if (!kid || kid.parentId !== user.uid) {
      throw new UnauthorizedException(
        'Access denied: Not the parent of this kid',
      );
    }

    // Return kid details with IPFS info (without decrypted data)
    return {
      ...kid,
      ipfsUrl: (kid as any).ipfsHash
        ? `https://gateway.pinata.cloud/ipfs/${(kid as any).ipfsHash}`
        : null,
      hasEncryptedData: !!(kid as any).ipfsHash,
    };
  }
}
