import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementRecordDto } from './dto/create-measurement-record.dto';
import { MeasurementRecordDto } from './dto/measurement-record.dto';
import { FirebaseAuthGuard } from '../auth/auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('measurements/:kidId')
export class MeasurementsController {
  constructor(private readonly service: MeasurementsService) {}

  @Get('weight')
  getWeight(
    @Param('kidId') kidId: string,
  ): Promise<MeasurementRecordDto[]> {
    return this.service.getRecords(kidId, 'weight');
  }

  @Post('weight')
  createWeight(
    @Param('kidId') kidId: string,
    @Body() dto: CreateMeasurementRecordDto,
  ): Promise<MeasurementRecordDto> {
    return this.service.createRecord(kidId, dto, 'weight');
  }

  @Get('height')
  getHeight(
    @Param('kidId') kidId: string,
  ): Promise<MeasurementRecordDto[]> {
    return this.service.getRecords(kidId, 'height');
  }

  @Post('height')
  createHeight(
    @Param('kidId') kidId: string,
    @Body() dto: CreateMeasurementRecordDto,
  ): Promise<MeasurementRecordDto> {
    return this.service.createRecord(kidId, dto, 'height');
  }

  @Get('head-circumference')
  getHeadCircumference(
    @Param('kidId') kidId: string,
  ): Promise<MeasurementRecordDto[]> {
    return this.service.getRecords(kidId, 'headCircumference');
  }

  @Post('head-circumference')
  createHeadCircumference(
    @Param('kidId') kidId: string,
    @Body() dto: CreateMeasurementRecordDto,
  ): Promise<MeasurementRecordDto> {
    return this.service.createRecord(kidId, dto, 'headCircumference');
  }
}
