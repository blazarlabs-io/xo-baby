import api from "./axios";

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

export interface MedicalDataBatchResponse {
  success: boolean;
  ipfsHash?: string;
  batchId: string;
  dataPointCount: number;
  processingTime: string;
  message: string;
}

export interface MedicalDataBatchMetadata {
  id: string;
  batchId: string;
  kidId: string;
  startTime: string;
  endTime: string;
  dataPointCount: number;
  averages: {
    heartRate: number;
    oximetry: number;
    breathingRate: number;
    temperature: number;
    movement: number;
  };
  ipfsHash: string;
  createdAt: string;
  status: string;
}

/**
 * Send medical data batch to backend
 */
export const uploadMedicalDataBatch = async (
  batch: MedicalDataBatch
): Promise<MedicalDataBatchResponse> => {
  try {
    console.log(`🚀 Uploading medical data batch for kid: ${batch.kidId}`);
    console.log(`📊 Batch contains ${batch.dataPoints.length} data points`);

    const response = await api.post("/medical-data/batch", batch);

    console.log(`✅ Medical data batch uploaded successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error uploading medical data batch:`, error);
    throw error;
  }
};

/**
 * Get medical data batches for a kid
 */
export const getMedicalDataBatches = async (
  kidId: string,
  limit?: number
): Promise<MedicalDataBatchMetadata[]> => {
  try {
    console.log(`📊 Getting medical data batches for kid: ${kidId}`);

    const params = limit ? { limit: limit.toString() } : {};
    const response = await api.get(`/medical-data/batches/${kidId}`, {
      params,
    });

    console.log(`✅ Retrieved ${response.data.length} medical data batches`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error getting medical data batches:`, error);
    throw error;
  }
};

/**
 * Get decrypted medical data for a specific batch
 */
export const getMedicalDataBatchData = async (
  batchId: string
): Promise<any> => {
  try {
    console.log(`🔓 Getting decrypted data for batch: ${batchId}`);

    const response = await api.get(`/medical-data/batch/${batchId}/data`);

    console.log(`✅ Retrieved decrypted batch data`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error getting batch data:`, error);
    throw error;
  }
};

/**
 * Check medical data service health
 */
export const checkMedicalDataHealth = async (): Promise<any> => {
  try {
    const response = await api.get("/medical-data/health");
    return response.data;
  } catch (error) {
    console.error(`❌ Error checking medical data service health:`, error);
    throw error;
  }
};
