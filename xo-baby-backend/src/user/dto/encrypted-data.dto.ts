export interface EncryptedDataDto {
  aesKey: string;
  encryptedData: string;
  ipfsHash: string;
  ipfsGatewayUrl: string;
  originalDataSize: number;
  encryptedDataSize: number;
  timestamp: string;
}

export interface MockUserDataDto {
  userId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    phoneNumber: string;
  };
  medicalInfo: {
    bloodType: string;
    allergies: string[];
    medications: string[];
    medicalHistory: string[];
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  preferences: {
    language: string;
    notifications: boolean;
    privacyLevel: 'public' | 'private' | 'restricted';
  };
  metadata: {
    createdAt: string;
    lastUpdated: string;
    dataVersion: string;
  };
}
