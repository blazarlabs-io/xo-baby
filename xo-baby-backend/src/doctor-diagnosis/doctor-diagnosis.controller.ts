import { Controller, Post, Body, Get, Query, Put, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { DoctorDiagnosisService } from './doctor-diagnosis.service';
import { CreateDoctorDiagnosisDto } from './dto/create-doctor-diagnosis.dto';
import { GetDoctorDiagnosisDto } from './dto/get-doctor-diagnosis.dto';
import { UpdateDoctorDiagnosisDto } from './dto/update-doctor-diagnosis.dto';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

interface RequestWithUser extends Request {
  user: DecodedIdToken;
}

@UseGuards(FirebaseAuthGuard)
@Controller('doctor-diagnosis')
export class DoctorDiagnosisController {
  constructor(private readonly doctorDiagnosisService: DoctorDiagnosisService) {}

  @Post('create')
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateDoctorDiagnosisDto,
  ) {
    const userId = req.user.uid;
    return this.doctorDiagnosisService.create(dto, userId);
  }

  @Get('get-all')
  async getAll(
    @Req() req: RequestWithUser,
    @Query() dto: GetDoctorDiagnosisDto,
  ) {
    const userId = req.user.uid;
    return this.doctorDiagnosisService.findAll(dto, userId);
  }

  @Put('update/:id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDiagnosisDto,
  ) {
    const userId = req.user.uid;
    return this.doctorDiagnosisService.update(id, dto, userId);
  }

  @Delete('delete/:id')
  async delete(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const userId = req.user.uid;
    return this.doctorDiagnosisService.delete(id, userId);
  }
}

