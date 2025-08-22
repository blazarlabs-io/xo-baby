export interface RealTimeMedicalDataDto {
  timestamp: string;
  heartRate: number;
  oximetry: number;
  breathingRate: number;
  temperature: number;
  movement: number;
}

export interface MedicalDataAveragesDto {
  heartRate: number;
  oximetry: number;
  breathingRate: number;
  temperature: number;
  movement: number;
}

export interface MedicalDataBatchDto {
  kidId: string;
  startTime: string;
  endTime: string;
  dataPoints: RealTimeMedicalDataDto[];
  averages: MedicalDataAveragesDto;
}

export interface MedicalDataBatchResponseDto {
  success: boolean;
  ipfsHash?: string;
  batchId: string;
  dataPointCount: number;
  processingTime: string;
  message: string;
}
