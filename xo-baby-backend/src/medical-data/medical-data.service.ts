import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { PinataService } from '../ipfs/pinata.service';
import { EncryptionService } from '../encryption/encryption.service';
import {
  MedicalDataBatchDto,
  MedicalDataBatchResponseDto,
  RealTimeMedicalDataDto,
  MedicalDataAveragesDto,
} from './dto/medical-data-batch.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class MedicalDataService {
  private readonly logger = new Logger(MedicalDataService.name);
  private db: admin.firestore.Firestore;

  constructor(
    private readonly firebase: FirebaseService,
    private readonly pinataService: PinataService,
    private readonly encryptionService: EncryptionService,
  ) {
    this.db = this.firebase.getFirestore();
  }

  /**
   * Process a batch of medical data from mobile app
   */
  async processMedicalDataBatch(
    batch: MedicalDataBatchDto,
  ): Promise<MedicalDataBatchResponseDto> {
    const startTime = Date.now();
    const batchId = this.generateBatchId(batch.kidId, batch.startTime);

    try {
      this.logger.log(
        `📦 Processing medical data batch for kid: ${batch.kidId}`,
      );
      this.logger.log(
        `📊 Batch contains ${batch.dataPoints.length} data points`,
      );
      this.logger.log(`📊 Time range: ${batch.startTime} to ${batch.endTime}`);
      this.logger.log(`📊 Averages:`, batch.averages);

      // Validate batch data
      this.validateBatch(batch);

      // Generate AES key for encryption
      const aesKey = this.encryptionService.generateAESKey();
      this.logger.log(`🔐 Generated AES key for batch encryption`);

      // Prepare data for encryption
      const medicalDataForEncryption = {
        kidId: batch.kidId,
        batchId,
        startTime: batch.startTime,
        endTime: batch.endTime,
        dataPointCount: batch.dataPoints.length,
        averages: batch.averages,
        dataPoints: batch.dataPoints,
        metadata: {
          collectionDuration: this.calculateDuration(
            batch.startTime,
            batch.endTime,
          ),
          sampleRate: this.calculateSampleRate(
            batch.dataPoints.length,
            batch.startTime,
            batch.endTime,
          ),
          processedAt: new Date().toISOString(),
          version: '1.0',
        },
      };

      // Generate data hash for integrity verification
      const dataHash = this.encryptionService.generateDataHash(
        JSON.stringify(medicalDataForEncryption),
      );

      // Encrypt the medical data
      this.logger.log(`🔐 Encrypting medical data batch...`);
      const encryptedData = this.encryptionService.encryptObject(
        medicalDataForEncryption,
        aesKey,
      );

      // Upload to IPFS via Pinata
      this.logger.log(`📤 Uploading encrypted batch to IPFS...`);
      const ipfsHash = await this.pinataService.uploadJSON({
        encryptedData,
        dataHash, // Include hash for integrity verification
        metadata: {
          type: 'medical-data-batch',
          kidId: batch.kidId,
          batchId,
          dataPointCount: batch.dataPoints.length,
          uploadedAt: new Date().toISOString(),
          encryptionVersion: '2.0',
          algorithm: 'AES-256-CBC',
        },
      });

      this.logger.log(
        `✅ Medical data uploaded to IPFS with hash: ${ipfsHash}`,
      );

      // Store batch metadata in Firestore
      await this.storeBatchMetadata(batch, batchId, ipfsHash, aesKey, dataHash);

      // Update kid's latest vitals with averages
      await this.updateKidVitals(batch.kidId, batch.averages);

      const processingTime = `${Date.now() - startTime}ms`;
      this.logger.log(
        `✅ Medical data batch processed successfully in ${processingTime}`,
      );

      return {
        success: true,
        ipfsHash,
        batchId,
        dataPointCount: batch.dataPoints.length,
        processingTime,
        message: `Successfully processed ${batch.dataPoints.length} medical data points and uploaded to IPFS`,
      };
    } catch (error) {
      const processingTime = `${Date.now() - startTime}ms`;
      this.logger.error(
        `❌ Error processing medical data batch: ${error.message}`,
      );

      return {
        success: false,
        batchId,
        dataPointCount: batch.dataPoints?.length || 0,
        processingTime,
        message: `Failed to process medical data batch: ${error.message}`,
      };
    }
  }

  /**
   * Validate medical data batch
   */
  private validateBatch(batch: MedicalDataBatchDto): void {
    if (!batch.kidId) {
      throw new Error('Kid ID is required');
    }

    if (!batch.dataPoints || batch.dataPoints.length === 0) {
      throw new Error('Batch must contain at least one data point');
    }

    if (!batch.startTime || !batch.endTime) {
      throw new Error('Start time and end time are required');
    }

    if (new Date(batch.endTime) <= new Date(batch.startTime)) {
      throw new Error('End time must be after start time');
    }

    // Validate each data point
    batch.dataPoints.forEach((dataPoint, index) => {
      this.validateDataPoint(dataPoint, index);
    });

    // Validate averages
    this.validateAverages(batch.averages);
  }

  /**
   * Validate individual data point
   */
  private validateDataPoint(
    dataPoint: RealTimeMedicalDataDto,
    index: number,
  ): void {
    const fields = [
      'heartRate',
      'oximetry',
      'breathingRate',
      'temperature',
      'movement',
    ];

    for (const field of fields) {
      if (typeof dataPoint[field] !== 'number' || isNaN(dataPoint[field])) {
        throw new Error(`Invalid ${field} in data point ${index}`);
      }
    }

    // Validate ranges (basic sanity checks)
    if (dataPoint.heartRate < 50 || dataPoint.heartRate > 200) {
      throw new Error(
        `Heart rate out of valid range in data point ${index}: ${dataPoint.heartRate}`,
      );
    }

    if (dataPoint.oximetry < 70 || dataPoint.oximetry > 100) {
      throw new Error(
        `Oximetry out of valid range in data point ${index}: ${dataPoint.oximetry}`,
      );
    }

    if (dataPoint.temperature < 30 || dataPoint.temperature > 45) {
      throw new Error(
        `Temperature out of valid range in data point ${index}: ${dataPoint.temperature}`,
      );
    }
  }

  /**
   * Validate averages
   */
  private validateAverages(averages: MedicalDataAveragesDto): void {
    const fields = [
      'heartRate',
      'oximetry',
      'breathingRate',
      'temperature',
      'movement',
    ];

    for (const field of fields) {
      if (typeof averages[field] !== 'number' || isNaN(averages[field])) {
        throw new Error(`Invalid average ${field}`);
      }
    }
  }

  /**
   * Store batch metadata in Firestore
   */
  private async storeBatchMetadata(
    batch: MedicalDataBatchDto,
    batchId: string,
    ipfsHash: string,
    aesKey: string,
    dataHash: string,
  ): Promise<void> {
    try {
      const batchMetadata = {
        batchId,
        kidId: batch.kidId,
        startTime: batch.startTime,
        endTime: batch.endTime,
        dataPointCount: batch.dataPoints.length,
        averages: batch.averages,
        ipfsHash,
        encryptionKey: aesKey, // Store encrypted in production
        dataHash, // Store hash for integrity verification
        createdAt: new Date().toISOString(),
        status: 'processed',
        encryptionVersion: '2.0',
        security: {
          algorithm: 'AES-256-CBC',
          hashAlgorithm: 'SHA-256',
          integrityProtected: true,
        },
      };

      await this.db
        .collection('medicalDataBatches')
        .doc(batchId)
        .set(batchMetadata);
      this.logger.log(`📝 Stored batch metadata in Firestore: ${batchId}`);
    } catch (error) {
      this.logger.error(`❌ Error storing batch metadata: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update kid's latest vitals with batch averages
   */
  private async updateKidVitals(
    kidId: string,
    averages: MedicalDataAveragesDto,
  ): Promise<void> {
    try {
      const kidRef = this.db.collection('kids').doc(kidId);

      await kidRef.update({
        'vitals.heartRate': averages.heartRate,
        'vitals.oximetry': averages.oximetry,
        'vitals.breathingRate': averages.breathingRate,
        'vitals.temperature': averages.temperature,
        'vitals.movement': averages.movement,
        'vitals.lastUpdated': new Date().toISOString(),
      });

      this.logger.log(
        `💗 Updated kid vitals for ${kidId} with latest averages`,
      );
    } catch (error) {
      this.logger.error(`❌ Error updating kid vitals: ${error.message}`);
      // Don't throw here - vitals update failure shouldn't fail the batch
    }
  }

  /**
   * Generate unique batch ID
   */
  private generateBatchId(kidId: string, startTime: string): string {
    const timestamp = new Date(startTime).getTime();
    return `batch_${kidId}_${timestamp}`;
  }

  /**
   * Calculate duration between two timestamps
   */
  private calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;
    const durationMin = Math.round(durationMs / (1000 * 60));
    return `${durationMin} minutes`;
  }

  /**
   * Calculate sample rate (samples per minute)
   */
  private calculateSampleRate(
    dataPointCount: number,
    startTime: string,
    endTime: string,
  ): number {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;
    const durationMin = durationMs / (1000 * 60);
    return Math.round(dataPointCount / durationMin);
  }

  /**
   * Get medical data batches for a kid
   */
  async getMedicalDataBatches(
    kidId: string,
    limit: number = 10,
  ): Promise<any[]> {
    try {
      const snapshot = await this.db
        .collection('medicalDataBatches')
        .where('kidId', '==', kidId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      this.logger.error(
        `❌ Error getting medical data batches: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get decrypted medical data from IPFS
   */
  async getDecryptedMedicalData(batchId: string): Promise<any> {
    try {
      // Get batch metadata from Firestore
      const batchDoc = await this.db
        .collection('medicalDataBatches')
        .doc(batchId)
        .get();

      if (!batchDoc.exists) {
        throw new Error(`Medical data batch not found: ${batchId}`);
      }

      const batchData = batchDoc.data();
      if (!batchData) {
        throw new Error(`No data found for batch: ${batchId}`);
      }

      const { ipfsHash, encryptionKey, dataHash } = batchData as {
        ipfsHash: string;
        encryptionKey: string;
        dataHash?: string;
      };

      // Get encrypted data from IPFS
      const ipfsResponse = await this.pinataService.getData(ipfsHash);

      // Parse the IPFS response to get the encrypted data and stored hash
      let encryptedDataString: string;
      let storedDataHash: string | null = null;

      if (typeof ipfsResponse === 'string') {
        try {
          const parsedResponse = JSON.parse(ipfsResponse);
          encryptedDataString = parsedResponse.encryptedData;
          storedDataHash = parsedResponse.dataHash;
        } catch {
          // If parsing fails, assume the entire response is the encrypted data
          encryptedDataString = ipfsResponse;
        }
      } else {
        const ipfsObj = ipfsResponse as any;
        encryptedDataString =
          ipfsObj.encryptedData || JSON.stringify(ipfsResponse);
        storedDataHash = ipfsObj.dataHash;
      }

      if (!encryptedDataString) {
        throw new Error('No encrypted data found in IPFS response');
      }

      // Decrypt the data
      const decryptedData = this.encryptionService.decryptToObject(
        encryptedDataString,
        encryptionKey,
      );

      // Verify data integrity if hash is available
      if (dataHash || storedDataHash) {
        const expectedHash = dataHash || storedDataHash;
        if (expectedHash) {
          const actualDataString = JSON.stringify(decryptedData);
          const isIntegrityValid = this.encryptionService.verifyDataHash(
            actualDataString,
            expectedHash,
          );

          if (!isIntegrityValid) {
            this.logger.warn(
              `⚠️ Data integrity check failed for batch: ${batchId}`,
            );
            // Continue processing but log the warning
          } else {
            this.logger.log(`✅ Data integrity verified for batch: ${batchId}`);
          }
        }
      } else {
        this.logger.warn(
          `⚠️ No integrity hash available for batch: ${batchId} - skipping verification`,
        );
      }

      this.logger.log(
        `🔓 Successfully decrypted medical data batch: ${batchId}`,
      );
      return decryptedData;
    } catch (error) {
      this.logger.error(
        `❌ Error getting decrypted medical data: ${error.message}`,
      );
      throw error;
    }
  }
}
