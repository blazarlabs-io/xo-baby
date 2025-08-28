import { MeasurementRecord } from './measurementsApi';

// Generate mock data for the last 9 months
const generateMockData = (kidId: string, type: 'weight' | 'height' | 'headCircumference'): MeasurementRecord[] => {
  const data: MeasurementRecord[] = [];
  const now = new Date();
  
  // Base values for different measurement types
  const baseValues = {
    weight: 3.5, // kg
    height: 50, // cm
    headCircumference: 35 // cm
  };
  
  // Growth rates per month
  const growthRates = {
    weight: 0.5, // kg/month
    height: 2.5, // cm/month
    headCircumference: 1.2 // cm/month
  };

  for (let i = 8; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 15); // 15th of each month
    const monthsAgo = 8 - i;
    
    let value: number;
    if (type === 'weight') {
      value = baseValues.weight + (monthsAgo * growthRates.weight) + (Math.random() - 0.5) * 0.2;
    } else if (type === 'height') {
      value = baseValues.height + (monthsAgo * growthRates.height) + (Math.random() - 0.5) * 2;
    } else {
      value = baseValues.headCircumference + (monthsAgo * growthRates.headCircumference) + (Math.random() - 0.5) * 0.5;
    }
    
    data.push({
      id: `mock-${type}-${i}`,
      kidId,
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      value: Math.round(value * 10) / 10 // Round to 1 decimal place
    });
  }
  
  return data;
};

export const getMockWeightRecords = (kidId: string): MeasurementRecord[] => {
  return generateMockData(kidId, 'weight');
};

export const getMockHeightRecords = (kidId: string): MeasurementRecord[] => {
  return generateMockData(kidId, 'height');
};

export const getMockHeadCircumferenceRecords = (kidId: string): MeasurementRecord[] => {
  return generateMockData(kidId, 'headCircumference');
};
