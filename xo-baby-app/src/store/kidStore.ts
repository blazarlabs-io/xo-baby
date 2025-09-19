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
    headCircumference?: number;
  };
  // usere
  weightHistory?: { value: number; date: string }[];
  heightHistory?: { value: number; date: string }[];
  headCircumferenceHistory?: { value: number; date: string }[];
}

interface KidStore {
  kids: Kid[];
  addKid: (kid: Kid) => void;
  addKids: (newKids: Kid[]) => void;
  setKids: (kids: Kid[]) => void;
  removeKid: (id: string) => void;
  clearKids: () => void;
}

export const useKidStore = create<KidStore>()(
  devtools(
    persist(
      (set, get) => ({
        kids: [],

        addKid: (kid: Kid) =>
          set((state) => {
            const exists = state.kids.some((k) => k.id === kid.id);
            if (exists) return state;
            return { kids: [...state.kids, kid] };
          }),

        addKids: (newKids: Kid[]) =>
          set((state) => {
            const currentIds = new Set(state.kids.map((k) => k.id));
            const filtered = newKids.filter((k) => !currentIds.has(k.id));
            return { kids: [...state.kids, ...filtered] };
          }),

        setKids: (kids: Kid[]) => set({ kids }),

        removeKid: (id: string) =>
          set((state) => ({
            kids: state.kids.filter((k) => k.id !== id),
          })),

        clearKids: () => set({ kids: [] }),
      }),
      {
        name: 'kids-storage', // AsyncStorage key
        storage: {
          getItem: async (name: string) => {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          },
          setItem: async (name: string, value: any) => {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: async (name: string) => {
            await AsyncStorage.removeItem(name);
          },
        },
        // @ts-ignore - Zustand persist partialize type issue
        partialize: (state: KidStore) => ({ kids: state.kids }),
        version: 1,
      }
    ),
    { name: 'KidStore' }
  )
);
