// kid.controller.ts
import { Controller, Get, Param, Headers, UnauthorizedException, Post, Body, Delete } from '@nestjs/common';
import { KidService } from './kid.service';
import { UserService } from '../user/user.service';
import { CreateKidDto } from './dto/create-kid.dto';
import { UpdateKidHeightDto, UpdateKidWeightDto } from './dto/update-kid-vitals.dto';

@Controller('kid')
export class KidController {
  constructor(
    private readonly kidService: KidService,
    private readonly userService: UserService,
  ) { }

  @Post('create')
  async createKid(@Body() dto: CreateKidDto) {
    console.log('📋 Kid creation request received at:', new Date().toISOString());
    console.log('📋 Request data:', JSON.stringify(dto, null, 2));
    console.log('📋 Request headers present, processing...');
    
    try {
      const result = await this.kidService.createKid(dto);
      console.log('✅ Kid created successfully at:', new Date().toISOString());
      console.log('✅ Response data:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('❌ Kid creation failed at:', new Date().toISOString());
      console.error('❌ Error details:', error);
      throw error;
    }
  }

  @Get('my-kids')
  async getKidsByUser(@Headers('authorization') authHeader: string) {
    console.log('📋 Get my kids request received');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const idToken = authHeader.replace('Bearer ', '');
    
    try {
      const result = await this.kidService.getKidsByUserToken(idToken);
      console.log(`✅ Found ${result?.length || 0} kids`);
      return result;
    } catch (error) {
      console.error('❌ Failed to get kids:', error);
      throw error;
    }
  }

  @Post('clear-cache')
  async clearBlockchainCache(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);
    
    // Only allow admin users to clear cache
    const userProfile = await this.userService.getUserProfile(user.uid);
    if (userProfile.role !== 'admin') {
      throw new UnauthorizedException('Access denied: Admin role required');
    }
    
    this.kidService.clearBlockchainCache();
    return { message: 'Blockchain cache cleared successfully' };
  }

  @Get(':id/weight')
  async getKidWeight(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    const kid = await this.kidService.findById(kidId);
    if (!kid || kid.parentId !== user.uid) {
      throw new UnauthorizedException('Access denied: Not the parent of this kid');
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
    @Headers('authorization') authHeader: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    const kid = await this.kidService.findById(kidId);
    if (!kid || kid.parentId !== user.uid) {
      throw new UnauthorizedException('Access denied: Not the parent of this kid');
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
    @Headers('authorization') authHeader: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    return this.kidService.getWeightHistory(kidId, user.uid);
  }

  @Get(':id/height-history')
  async getHeightHistory(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    return this.kidService.getHeightHistory(kidId, user.uid);
  }

  @Post(':id/weight')
  async updateKidWeight(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string,
    @Body() dto: UpdateKidWeightDto
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    return this.kidService.updateWeight(kidId, user.uid, dto.weight, dto.date);
  }

  @Post(':id/height')
  async updateKidHeight(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string,
    @Body() dto: UpdateKidHeightDto
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    return this.kidService.updateHeight(kidId, user.uid, dto.height, dto.date);
  }

  @Delete(':id')
  async deleteKid(
    @Param('id') kidId: string,
    @Headers('authorization') authHeader: string
  ) {
    console.log('🗑️ Delete kid request received');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.userService.verifyIdToken(token);

    // Check if user has admin role
    const userProfile = await this.userService.getUserProfile(user.uid);
    if (userProfile.role !== 'admin') {
      throw new UnauthorizedException('Access denied: Admin role required to delete kids');
    }

    try {
      await this.kidService.deleteKid(kidId);
      console.log(`✅ Kid ${kidId} deleted successfully`);
      return { message: 'Kid deleted successfully', kidId };
    } catch (error) {
      console.error('❌ Failed to delete kid:', error);
      throw error;
    }
  }
}
