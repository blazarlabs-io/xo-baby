import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  removeKid: (id: string) => void;
  clearKids: () => void;
}

export const useKidStore = create<KidStore>()(
  devtools(
    persist(
      (set, get) => ({
        kids: [],

        addKid: (kid) =>
          set((state) => {
            const exists = state.kids.some((k) => k.id === kid.id);
            if (exists) return state;
            return { kids: [...state.kids, kid] };
          }),

        addKids: (newKids) =>
          set((state) => {
            const currentIds = new Set(state.kids.map((k) => k.id));
            const filtered = newKids.filter((k) => !currentIds.has(k.id));
            return { kids: [...state.kids, ...filtered] };
          }),

        removeKid: (id) =>
          set((state) => ({
            kids: state.kids.filter((k) => k.id !== id),
          })),

        clearKids: () => set({ kids: [] }),
      }),
      {
        name: 'kids-storage', // AsyncStorage key
        storage: {
          getItem: async (name) => {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          },
          setItem: async (name, value) => {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: async (name) => {
            await AsyncStorage.removeItem(name);
          },
        },
        partialize: (state) => ({ kids: state.kids }),
        version: 1,
      }
    ),
    {name: 'KidStore'}
  )
);
