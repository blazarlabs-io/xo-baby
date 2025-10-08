import { Controller, Post, Body, Get, Query, Put, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { VaccinationService } from './vaccination.service';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { GetVaccinationDto } from './dto/get-vaccination.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

interface RequestWithUser extends Request {
  user: DecodedIdToken;
}

@UseGuards(FirebaseAuthGuard)
@Controller('vaccination')
export class VaccinationController {
  constructor(private readonly vaccinationService: VaccinationService) {}

  @Post('create')
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateVaccinationDto,
  ) {
    const userId = req.user.uid;
    return this.vaccinationService.create(dto, userId);
  }

  @Get('get-all')
  async getAll(
    @Req() req: RequestWithUser,
    @Query() dto: GetVaccinationDto,
  ) {
    const userId = req.user.uid;
    return this.vaccinationService.findAll(dto, userId);
  }

  @Put('update/:id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateVaccinationDto,
  ) {
    const userId = req.user.uid;
    return this.vaccinationService.update(id, dto, userId);
  }

  @Delete('delete/:id')
  async delete(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const userId = req.user.uid;
    return this.vaccinationService.delete(id, userId);
  }
}

