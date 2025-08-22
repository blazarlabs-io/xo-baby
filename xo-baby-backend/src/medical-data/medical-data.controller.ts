import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { MedicalDataService } from './medical-data.service';
import {
  MedicalDataBatchDto,
  MedicalDataBatchResponseDto,
} from './dto/medical-data-batch.dto';

@Controller('medical-data')
export class MedicalDataController {
  private readonly logger = new Logger(MedicalDataController.name);

  constructor(private readonly medicalDataService: MedicalDataService) {}

  /**
   * Receive and process medical data batch from mobile app
   */
  @Post('batch')
  async processBatch(
    @Body() batch: MedicalDataBatchDto,
  ): Promise<MedicalDataBatchResponseDto> {
    this.logger.log(`📦 Received medical data batch for kid: ${batch.kidId}`);
    this.logger.log(
      `📊 Batch contains ${batch.dataPoints?.length || 0} data points`,
    );

    try {
      return await this.medicalDataService.processMedicalDataBatch(batch);
    } catch (error) {
      this.logger.error(
        `❌ Error processing medical data batch: ${error.message}`,
      );
      return {
        success: false,
        batchId: `error_${Date.now()}`,
        dataPointCount: batch.dataPoints?.length || 0,
        processingTime: '0ms',
        message: `Error processing batch: ${error.message}`,
      };
    }
  }

  /**
   * Get medical data batches for a specific kid
   */
  @Get('batches/:kidId')
  async getBatches(
    @Param('kidId') kidId: string,
    @Query('limit') limit?: string,
  ) {
    this.logger.log(`📊 Getting medical data batches for kid: ${kidId}`);

    try {
      const limitNum = limit ? parseInt(limit, 10) : 10;
      return await this.medicalDataService.getMedicalDataBatches(
        kidId,
        limitNum,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error getting medical data batches: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get decrypted medical data for a specific batch
   */
  @Get('batch/:batchId/data')
  async getBatchData(@Param('batchId') batchId: string) {
    this.logger.log(`🔓 Getting decrypted data for batch: ${batchId}`);

    try {
      return await this.medicalDataService.getDecryptedMedicalData(batchId);
    } catch (error) {
      this.logger.error(`❌ Error getting batch data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Health check endpoint for medical data service
   */
  @Get('health')
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'medical-data',
      timestamp: new Date().toISOString(),
      message: 'Medical data service is running',
    };
  }
}
