import { Body, Controller, Post } from '@nestjs/common';
import { KidService } from './kid.service';
import { CreateKidDto } from './dto/create-kid.dto';

@Controller('kids')
export class KidController {
  constructor(private readonly kidService: KidService) {}

  @Post('create')
  async createKid(@Body() dto: CreateKidDto) {
    return this.kidService.createKid(dto);
  }
}


// 8l4p3sgjJ0g6NYLErsB4HBeW70a2 parent uid