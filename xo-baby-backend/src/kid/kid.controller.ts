import { Body, Controller, Post, Get, Headers, UnauthorizedException  } from '@nestjs/common';
import { KidService } from './kid.service';
import { CreateKidDto } from './dto/create-kid.dto';

@Controller('kids')
export class KidController {
  constructor(private readonly kidService: KidService) {}

  @Post('create')
  async createKid(@Body() dto: CreateKidDto) {
    return this.kidService.createKid(dto);
  }

  @Get('my-kids')
  async getKidsByUser(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const idToken = authHeader.replace('Bearer ', '');
    return this.kidService.getKidsByUserToken(idToken);
  }


}


// 8l4p3sgjJ0g6NYLErsB4HBeW70a2 parent uid