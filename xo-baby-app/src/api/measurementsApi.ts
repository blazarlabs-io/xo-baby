import api from './axios';

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
 * Helper to include the Authorization header
 */
const buildAuthHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ----- Weight -----
/**
 * Fetch all weight records for a given kid
 */
export const getWeightRecords = async (
  token: string,
  kidId: string
): Promise<MeasurementRecord[]> => {
  const response = await api.get<MeasurementRecord[]>(
    `/measurements/${kidId}/weight`,
    buildAuthHeader(token)
  );
  return response.data;
};

/**
 * Create a new weight record for a given kid
 */
export const createWeightRecord = async (
  token: string,
  kidId: string,
  data: CreateMeasurementRecordPayload
): Promise<MeasurementRecord> => {
  const response = await api.post<MeasurementRecord>(
    `/measurements/${kidId}/weight`,
    data,
    buildAuthHeader(token)
  );
  return response.data;
};

// ----- Height -----
/**
 * Fetch all height records for a given kid
 */
export const getHeightRecords = async (
  token: string,
  kidId: string
): Promise<MeasurementRecord[]> => {
  const response = await api.get<MeasurementRecord[]>(
    `/measurements/${kidId}/height`,
    buildAuthHeader(token)
  );
  return response.data;
};

/**
 * Create a new height record for a given kid
 */
export const createHeightRecord = async (
  token: string,
  kidId: string,
  data: CreateMeasurementRecordPayload
): Promise<MeasurementRecord> => {
  const response = await api.post<MeasurementRecord>(
    `/measurements/${kidId}/height`,
    data,
    buildAuthHeader(token)
  );
  return response.data;
};

// ----- Head Circumference -----
/**
 * Fetch all head circumference records for a given kid
 */
export const getHeadCircumferenceRecords = async (
  token: string,
  kidId: string
): Promise<MeasurementRecord[]> => {
  const response = await api.get<MeasurementRecord[]>(
    `/measurements/${kidId}/head-circumference`,
    buildAuthHeader(token)
  );
  return response.data;
};

/**
 * Create a new head circumference record for a given kid
 */
export const createHeadCircumferenceRecord = async (
  token: string,
  kidId: string,
  data: CreateMeasurementRecordPayload
): Promise<MeasurementRecord> => {
  const response = await api.post<MeasurementRecord>(
    `/measurements/${kidId}/head-circumference`,
    data,
    buildAuthHeader(token)
  );
  return response.data;
};
