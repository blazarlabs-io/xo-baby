import {
  Controller,
  Get,
  Param,
  Headers,
  UnauthorizedException,
  Post,
  Body,
  Query,
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

  // @Get('my-kids')
  // async getKidsByUser(@Headers('authorization') authHeader: string) {
  //   if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //     throw new UnauthorizedException(
  //       'Missing or invalid Authorization header',
  //     );
  //   }
  //   const idToken = authHeader.replace('Bearer ', '');
  //   return this.kidService.getKidsWithRoleInfo(idToken);
  // }

  @Get('my-kids-basic')
  async getKidsBasicInfo(@Query('uid') uid: string) {
    if (!uid) {
      throw new UnauthorizedException('User ID is required');
    }
    console.log('Backend: Received request for UID:', uid);
    try {
      const result = await this.kidService.getKidsBasicInfo(uid);
      console.log(
        'Backend: Successfully returning',
        Array.isArray(result) ? result.length : 0,
        'kids',
      );
      return result;
    } catch (error) {
      console.error('Backend: Error in getKidsBasicInfo:', error.message);
      throw new Error(`Failed to retrieve kids data: ${error.message}`);
    }
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

    // Use the new access control method
    const access = await this.kidService.checkUserAccessToKid(user.uid, kidId);
    if (!access.hasAccess || !access.permissions.canViewVitals) {
      throw new UnauthorizedException(
        "Access denied: You do not have permission to view this kid's vitals",
      );
    }

    const kid = await this.kidService.findById(kidId);
    if (!kid) {
      throw new UnauthorizedException('Kid not found');
    }

    return {
      kidId: kid.id,
      weight: kid.vitals.weight || null,
      updatedAt: kid.createdAt,
      userRole: access.role,
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

    // Use the new access control method
    const access = await this.kidService.checkUserAccessToKid(user.uid, kidId);
    if (!access.hasAccess || !access.permissions.canViewVitals) {
      throw new UnauthorizedException(
        "Access denied: You do not have permission to view this kid's vitals",
      );
    }

    const kid = await this.kidService.findById(kidId);
    if (!kid) {
      throw new UnauthorizedException('Kid not found');
    }

    return {
      kidId: kid.id,
      height: kid.vitals.height || null,
      updatedAt: kid.createdAt,
      userRole: access.role,
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

    // Use the new access control method
    const access = await this.kidService.checkUserAccessToKid(user.uid, kidId);
    if (!access.hasAccess || !access.permissions.canViewVitals) {
      throw new UnauthorizedException(
        "Access denied: You do not have permission to view this kid's data",
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

    // Use the new access control method
    const access = await this.kidService.checkUserAccessToKid(user.uid, kidId);
    if (!access.hasAccess) {
      throw new UnauthorizedException(
        'Access denied: You do not have permission to view this kid',
      );
    }

    // Get kid details
    const kid = await this.kidService.findById(kidId);
    if (!kid) {
      throw new UnauthorizedException('Kid not found');
    }

    // Return kid details with IPFS info (without decrypted data)
    return {
      ...kid,
      userRole: access.role,
      permissions: access.permissions,
      ipfsUrl: (kid as any).ipfsHash
        ? `https://gateway.pinata.cloud/ipfs/${(kid as any).ipfsHash}`
        : null,
      hasEncryptedData: !!(kid as any).ipfsHash,
    };
  }
}
