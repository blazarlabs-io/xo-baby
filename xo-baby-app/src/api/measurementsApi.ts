import api from "./axios";

/**
 * Payload for creating a new measurement record
 */
export interface CreateMeasurementRecordPayload {
  /** ISO date string, e.g. '2025-07-15' */
  date: string;
  /** Measurement value (e.g. weight in kg, height in cm) */
  value: number;
}

/**
 * Represents a measurement record returned from the API
 */
export interface MeasurementRecord {
  id: string;
  kidId: string;
  date: string;
  value: number;
}

/**
 * Helper to include the Authorization header (currently disabled for development)
 */
const buildAuthHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Helper function to handle API calls with proper error handling
const handleApiCall = async <T>(
  apiCall: () => Promise<T>,
  type: string
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error(`API call for ${type} failed:`, error);
    throw error; // Re-throw the error instead of falling back to mock data
  }
};

// ----- Weight -----
/**
 * Fetch all weight records for a given kid
 */
export const getWeightRecords = async (
  kidId: string
): Promise<MeasurementRecord[]> => {
  return handleApiCall(async () => {
    const response = await api.get<MeasurementRecord[]>(
      `/measurements/${kidId}/weight`
    );
    return response.data;
  }, "weight");
};

/**
 * Create a new weight record for a given kid
 */
export const createWeightRecord = async (
  kidId: string,
  data: CreateMeasurementRecordPayload
): Promise<MeasurementRecord> => {
  const response = await api.post<MeasurementRecord>(
    `/measurements/${kidId}/weight`,
    data
  );
  return response.data;
};

// ----- Height -----
/**
 * Fetch all height records for a given kid
 */
export const getHeightRecords = async (
  kidId: string
): Promise<MeasurementRecord[]> => {
  return handleApiCall(async () => {
    const response = await api.get<MeasurementRecord[]>(
      `/measurements/${kidId}/height`
    );
    return response.data;
  }, "height");
};

/**
 * Create a new height record for a given kid
 */
export const createHeightRecord = async (
  kidId: string,
  data: CreateMeasurementRecordPayload
): Promise<MeasurementRecord> => {
  const response = await api.post<MeasurementRecord>(
    `/measurements/${kidId}/height`,
    data
  );
  return response.data;
};

// ----- Head Circumference -----
/**
 * Fetch all head circumference records for a given kid
 */
export const getHeadCircumferenceRecords = async (
  kidId: string
): Promise<MeasurementRecord[]> => {
  return handleApiCall(async () => {
    const response = await api.get<MeasurementRecord[]>(
      `/measurements/${kidId}/head-circumference`
    );
    return response.data;
  }, "head circumference");
};

/**
 * Create a new head circumference record for a given kid
 */
export const createHeadCircumferenceRecord = async (
  kidId: string,
  data: CreateMeasurementRecordPayload
): Promise<MeasurementRecord> => {
  const response = await api.post<MeasurementRecord>(
    `/measurements/${kidId}/head-circumference`,
    data
  );
  return response.data;
};
