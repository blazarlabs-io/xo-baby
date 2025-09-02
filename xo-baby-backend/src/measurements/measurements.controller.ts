import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementRecordDto } from './dto/create-measurement-record.dto';
import { MeasurementRecordDto } from './dto/measurement-record.dto';

@Controller('measurements/:kidId')
export class MeasurementsController {
  constructor(private readonly service: MeasurementsService) {}

  @Get('test')
  async testConnection(@Param('kidId') kidId: string) {
    try {
      // Test Firebase connection
      const db = this.service['db'];
      const collections = await db.listCollections();
      return {
        success: true,
        kidId,
        collections: collections.map((col) => col.id),
        message: 'Firebase connection successful',
      };
    } catch (error) {
      return {
        success: false,
        kidId,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  @Get('weight')
  async getWeight(
    @Param('kidId') kidId: string,
  ): Promise<MeasurementRecordDto[]> {
    try {
      return await this.service.getRecords(kidId, 'weight');
    } catch (error) {
      console.error('Error getting weight records:', error);
      throw error;
    }
  }

  @Post('weight')
  createWeight(
    @Param('kidId') kidId: string,
    @Body() dto: CreateMeasurementRecordDto,
  ): Promise<MeasurementRecordDto> {
    return this.service.createRecord(kidId, dto, 'weight');
  }

  @Get('height')
  getHeight(@Param('kidId') kidId: string): Promise<MeasurementRecordDto[]> {
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
