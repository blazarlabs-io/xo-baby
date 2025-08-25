import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  uploadMedicalDataBatch,
  MedicalDataBatchResponse,
} from "../api/medicalDataApi";

export interface RealTimeMedicalData {
  timestamp: string;
  heartRate: number;
  oximetry: number;
  breathingRate: number;
  temperature: number;
  movement: number;
}

export interface MedicalDataBatch {
  kidId: string;
  startTime: string;
  endTime: string;
  dataPoints: RealTimeMedicalData[];
  averages: {
    heartRate: number;
    oximetry: number;
    breathingRate: number;
    temperature: number;
    movement: number;
  };
}

class MedicalDataService {
  private isCollecting = false;
  private dataBuffer: RealTimeMedicalData[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private batchInterval: NodeJS.Timeout | null = null;
  private currentKidId: string | null = null;
  private batchStartTime: string | null = null;

  // Storage keys
  private readonly STORAGE_KEY_PREFIX = "medical_data_batch_";
  private readonly COLLECTION_STATUS_KEY = "medical_data_collection_status";

  /**
   * Generate realistic random medical data for baby monitoring
   */
  private generateRandomMedicalData(): RealTimeMedicalData {
    const now = new Date().toISOString();

    // Generate realistic baby vital signs with some variance
    const baseHeartRate = 120; // BPM for babies
    const baseOximetry = 98; // SpO2 percentage
    const baseBreathingRate = 30; // Breaths per minute for babies
    const baseTemperature = 37.0; // Celsius
    const baseMovement = 50; // Movement intensity

    return {
      timestamp: now,
      heartRate: Math.round(baseHeartRate + (Math.random() - 0.5) * 20), // 110-130 BPM
      oximetry:
        Math.round((baseOximetry + (Math.random() - 0.5) * 4) * 10) / 10, // 96-100%
      breathingRate: Math.round(baseBreathingRate + (Math.random() - 0.5) * 10), // 25-35 breaths/min
      temperature:
        Math.round((baseTemperature + (Math.random() - 0.5) * 2) * 100) / 100, // 36-38°C
      movement: Math.round(baseMovement + (Math.random() - 0.5) * 60), // 20-80 intensity
    };
  }

  /**
   * Calculate averages for a batch of data
   */
  private calculateAverages(dataPoints: RealTimeMedicalData[]) {
    if (dataPoints.length === 0) {
      return {
        heartRate: 0,
        oximetry: 0,
        breathingRate: 0,
        temperature: 0,
        movement: 0,
      };
    }

    const totals = dataPoints.reduce(
      (acc, data) => ({
        heartRate: acc.heartRate + data.heartRate,
        oximetry: acc.oximetry + data.oximetry,
        breathingRate: acc.breathingRate + data.breathingRate,
        temperature: acc.temperature + data.temperature,
        movement: acc.movement + data.movement,
      }),
      {
        heartRate: 0,
        oximetry: 0,
        breathingRate: 0,
        temperature: 0,
        movement: 0,
      }
    );

    const count = dataPoints.length;
    return {
      heartRate: Math.round(totals.heartRate / count),
      oximetry: Math.round((totals.oximetry / count) * 10) / 10,
      breathingRate: Math.round(totals.breathingRate / count),
      temperature: Math.round((totals.temperature / count) * 100) / 100,
      movement: Math.round(totals.movement / count),
    };
  }

  /**
   * Start collecting medical data every second
   */
  async startDataCollection(kidId: string): Promise<void> {
    if (this.isCollecting) {
      console.log("🩺 Medical data collection already running");
      return;
    }

    this.currentKidId = kidId;
    this.isCollecting = true;
    this.dataBuffer = [];
    this.batchStartTime = new Date().toISOString();

    console.log(`🩺 Starting medical data collection for kid: ${kidId}`);

    // Store collection status
    await AsyncStorage.setItem(
      this.COLLECTION_STATUS_KEY,
      JSON.stringify({
        isCollecting: true,
        kidId,
        startTime: this.batchStartTime,
      })
    );

    // Generate data every second
    this.intervalId = setInterval(() => {
      const medicalData = this.generateRandomMedicalData();
      this.dataBuffer.push(medicalData);

      console.log(
        `📊 Generated medical data: HR:${medicalData.heartRate} SpO2:${medicalData.oximetry}% BR:${medicalData.breathingRate} T:${medicalData.temperature}°C M:${medicalData.movement}`
      );
    }, 1000);

    // Send batch every 10 minutes (600 seconds)
    this.batchInterval = setInterval(async () => {
      await this.sendBatchToBackend();
    }, 10 * 60 * 1000); // 10 minutes

    console.log("✅ Medical data collection started successfully");
  }

  /**
   * Stop collecting medical data
   */
  async stopDataCollection(): Promise<void> {
    if (!this.isCollecting) {
      console.log("🩺 No medical data collection running");
      return;
    }

    console.log("🛑 Stopping medical data collection");

    this.isCollecting = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
    }

    // Send final batch if there's data
    if (this.dataBuffer.length > 0) {
      await this.sendBatchToBackend();
    }

    // Clear collection status
    await AsyncStorage.removeItem(this.COLLECTION_STATUS_KEY);

    this.dataBuffer = [];
    this.currentKidId = null;
    this.batchStartTime = null;

    console.log("✅ Medical data collection stopped");
  }

  /**
   * Send collected data batch to backend
   */
  private async sendBatchToBackend(): Promise<void> {
    if (
      !this.currentKidId ||
      !this.batchStartTime ||
      this.dataBuffer.length === 0
    ) {
      console.log("🩺 No data to send to backend");
      return;
    }

    try {
      const endTime = new Date().toISOString();
      const averages = this.calculateAverages(this.dataBuffer);

      const batch: MedicalDataBatch = {
        kidId: this.currentKidId,
        startTime: this.batchStartTime,
        endTime,
        dataPoints: [...this.dataBuffer],
        averages,
      };

      console.log(
        `📦 Preparing to send batch with ${batch.dataPoints.length} data points`
      );
      console.log(`📊 Batch averages:`, averages);

      // Store batch locally before sending (for offline support)
      const batchKey = `${this.STORAGE_KEY_PREFIX}${Date.now()}`;
      await AsyncStorage.setItem(batchKey, JSON.stringify(batch));

      // Send to backend API
      await this.uploadBatchToBackend(batch);

      console.log("🚀 Medical data batch uploaded to backend successfully:", {
        kidId: batch.kidId,
        duration: `${this.batchStartTime} to ${endTime}`,
        dataPointCount: batch.dataPoints.length,
        averages: batch.averages,
      });

      // Clear buffer for next batch
      this.dataBuffer = [];
      this.batchStartTime = new Date().toISOString();
    } catch (error) {
      console.error("❌ Error sending medical data batch:", error);
    }
  }

  /**
   * Get current collection status
   */
  async getCollectionStatus(): Promise<{
    isCollecting: boolean;
    kidId?: string;
    startTime?: string;
    currentBufferSize?: number;
  }> {
    try {
      const statusData = await AsyncStorage.getItem(this.COLLECTION_STATUS_KEY);
      if (!statusData) {
        return { isCollecting: false };
      }

      const status = JSON.parse(statusData);
      return {
        ...status,
        currentBufferSize: this.dataBuffer.length,
      };
    } catch (error) {
      console.error("❌ Error getting collection status:", error);
      return { isCollecting: false };
    }
  }

  /**
   * Get current real-time data (latest reading)
   */
  getCurrentData(): RealTimeMedicalData | null {
    if (this.dataBuffer.length === 0) {
      return null;
    }
    return this.dataBuffer[this.dataBuffer.length - 1];
  }

  /**
   * Get latest historical data from database when not collecting
   */
  async getLatestHistoricalData(
    kidId: string
  ): Promise<RealTimeMedicalData | null> {
    try {
      console.log(`📊 Fetching latest historical data for kid: ${kidId}`);

      // Get the most recent batch from the database
      const { getMedicalDataBatches, getMedicalDataBatchData } = await import(
        "../api/medicalDataApi"
      );
      const batches = await getMedicalDataBatches(kidId, 1);

      if (batches.length === 0) {
        console.log("📊 No historical data found for kid, returning demo data");
        return this.getDemoHistoricalData();
      }

      const latestBatch = batches[0];
      console.log(
        `📊 Found latest batch: ${latestBatch.batchId} with ${latestBatch.dataPointCount} data points`
      );

      // Get the actual data from the batch
      const batchData = await getMedicalDataBatchData(latestBatch.batchId);

      if (
        batchData &&
        batchData.dataPoints &&
        batchData.dataPoints.length > 0
      ) {
        // Return the most recent data point from the latest batch
        const latestDataPoint = batchData.dataPoints[0]; // Assuming dataPoints are ordered by timestamp
        console.log(
          `📊 Retrieved latest historical data: HR:${latestDataPoint.heartRate} SpO2:${latestDataPoint.oximetry}% BR:${latestDataPoint.breathingRate} T:${latestDataPoint.temperature}°C M:${latestDataPoint.movement}`
        );
        return latestDataPoint;
      }

      return this.getDemoHistoricalData();
    } catch (error) {
      console.error("❌ Error fetching latest historical data:", error);
      console.log("📊 Falling back to demo data");
      return this.getDemoHistoricalData();
    }
  }

  /**
   * Get average historical data from database when not collecting
   */
  async getAverageHistoricalData(
    kidId: string
  ): Promise<RealTimeMedicalData | null> {
    try {
      console.log(`📊 Fetching average historical data for kid: ${kidId}`);

      // Get the most recent batch from the database
      const { getMedicalDataBatches } = await import("../api/medicalDataApi");
      const batches = await getMedicalDataBatches(kidId, 1);

      if (batches.length === 0) {
        console.log("📊 No historical data found for kid, returning demo data");
        return this.getDemoHistoricalData();
      }

      const latestBatch = batches[0];
      console.log(
        `📊 Found latest batch: ${latestBatch.batchId} with averages`
      );

      // Use the pre-calculated averages from the batch metadata
      if (latestBatch.averages) {
        const averageData: RealTimeMedicalData = {
          timestamp: latestBatch.endTime, // Use end time as timestamp
          heartRate: latestBatch.averages.heartRate,
          oximetry: latestBatch.averages.oximetry,
          breathingRate: latestBatch.averages.breathingRate,
          temperature: latestBatch.averages.temperature,
          movement: latestBatch.averages.movement,
        };

        console.log(
          `📊 Retrieved average historical data: HR:${averageData.heartRate} SpO2:${averageData.oximetry}% BR:${averageData.breathingRate} T:${averageData.temperature}°C M:${averageData.movement}`
        );
        return averageData;
      }

      return this.getDemoHistoricalData();
    } catch (error) {
      console.error("❌ Error fetching average historical data:", error);
      console.log("📊 Falling back to demo data");
      return this.getDemoHistoricalData();
    }
  }

  /**
   * Get demo historical data when no real data exists
   */
  private getDemoHistoricalData(): RealTimeMedicalData {
    return {
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      heartRate: 118,
      oximetry: 98.5,
      breathingRate: 28,
      temperature: 37.2,
      movement: 45,
    };
  }

  /**
   * Get stored batches (for debugging/offline sync)
   */
  async getStoredBatches(): Promise<MedicalDataBatch[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const batchKeys = allKeys.filter((key) =>
        key.startsWith(this.STORAGE_KEY_PREFIX)
      );

      const batches: MedicalDataBatch[] = [];
      for (const key of batchKeys) {
        const batchData = await AsyncStorage.getItem(key);
        if (batchData) {
          batches.push(JSON.parse(batchData));
        }
      }

      return batches.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    } catch (error) {
      console.error("❌ Error getting stored batches:", error);
      return [];
    }
  }

  /**
   * Upload batch to backend API
   */
  private async uploadBatchToBackend(
    batch: MedicalDataBatch
  ): Promise<MedicalDataBatchResponse> {
    try {
      console.log(
        `🌐 Uploading batch to backend: ${batch.dataPoints.length} data points`
      );

      const response = await uploadMedicalDataBatch(batch);

      if (response.success) {
        console.log(
          `✅ Batch uploaded successfully to IPFS: ${response.ipfsHash}`
        );
        console.log(`📊 Processing time: ${response.processingTime}`);

        // Remove stored batch after successful upload
        const allKeys = await AsyncStorage.getAllKeys();
        const batchKeys = allKeys.filter((key) =>
          key.startsWith(this.STORAGE_KEY_PREFIX)
        );
        const latestBatchKey = batchKeys[batchKeys.length - 1];
        if (latestBatchKey) {
          await AsyncStorage.removeItem(latestBatchKey);
          console.log("🗑️ Removed uploaded batch from local storage");
        }
      } else {
        console.error(`❌ Backend upload failed: ${response.message}`);
        throw new Error(response.message);
      }

      return response;
    } catch (error) {
      console.error("❌ Error uploading batch to backend:", error);
      throw error;
    }
  }

  /**
   * Clear all stored batches
   */
  async clearStoredBatches(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const batchKeys = allKeys.filter((key) =>
        key.startsWith(this.STORAGE_KEY_PREFIX)
      );
      await AsyncStorage.multiRemove(batchKeys);
      console.log("🗑️ Cleared all stored medical data batches");
    } catch (error) {
      console.error("❌ Error clearing stored batches:", error);
    }
  }
}

// Export singleton instance
export const medicalDataService = new MedicalDataService();
