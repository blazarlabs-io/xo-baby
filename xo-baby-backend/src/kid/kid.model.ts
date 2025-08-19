export interface Kid {
  id: string;
  childId: string; // Blockchain child ID
  parentId: string;
  adminId?: string;
  doctorId?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  bloodType: string;
  ethnicity: string;
  location: string;
  congenitalAnomalies: { name: string; description: string }[];
  avatarUrl?: string;
  createdAt: string;
  ipfsHash: string; // IPFS hash for encrypted data
  nftTxHash?: string; // NFT transaction hash
  encryptedData: string; // Truncated encrypted data for reference
  vitals: {
    heartRate: number;
    oximetry: number;
    breathingRate?: number;
    temperature?: number;
    movement?: number;
    weight?: number;
    height?: number;
    headCircumference?: number;
    feedingSchedule?: string;
  };

  weightHistory?: { value: number; date: string }[];
  heightHistory?: { value: number; date: string }[];
  headCircumferenceHistory?: { value: number; date: string }[];
}

// Extended interface for kids with role information
export interface KidWithRole extends Kid {
  userRole: 'parent' | 'admin' | 'doctor' | 'viewer';
  canEdit: boolean;
  canDelete: boolean;
  canViewVitals: boolean;
}
