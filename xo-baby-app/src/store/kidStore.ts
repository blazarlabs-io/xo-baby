import { create } from 'zustand';

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
}

interface KidStore {
  kids: Kid[];
  addKid: (kid: Kid) => void;
  addKids: (newKids: Kid[]) => void;
}

export const useKidStore = create<KidStore>((set, get) => ({
  kids: [],
  addKid: (kid) =>
    set((state) => {
      const alreadyExists = state.kids.some((k) => k.id === kid.id);
      if (alreadyExists) return state; 
      return { kids: [...state.kids, kid] };
    }),
  addKids: (newKids) =>
    set((state) => {
      const currentIds = new Set(state.kids.map((k) => k.id));
      const filtered = newKids.filter((k) => !currentIds.has(k.id));
      return { kids: [...state.kids, ...filtered] };
    }),
}));
