import api from "./axios";

export interface CreateMeasurementRecordPayload {
  date: string;
  value: number;
}

export interface MeasurementRecord {
  id: string;
  kidId: string;
  date: string;
  value: number;
}

const buildAuthHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ----- Weight -----
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
