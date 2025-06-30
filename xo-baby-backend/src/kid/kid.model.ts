export interface Kid {
  id: string;
  parentId: string;
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
  vitals: {
    heartRate: number;
    oximetry: number;
    breathingRate?: number;
    temperature?: number;
    movement?: number;
    weight?: number;
    height?: number;
    feedingSchedule?: string;
  };

  weightHistory?: { value: number; date: string }[];
  heightHistory?: { value: number; date: string }[];

}
