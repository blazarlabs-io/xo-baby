import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Kid {
  id: string;
  childId?: string;
  parentId: string;
  adminId?: string | null;
  doctorId?: string | null;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  bloodType: string;
  ethnicity: string;
  location: string;
  congenitalAnomalies: { name: string; description: string }[] | any[];
  avatarUrl?: string;
  createdAt: string;
  vitals: {
    heartRate?: number;
    oximetry?: number;
    breathingRate?: number;
    temperature?: number;
    movement?: number;
    weight?: number;
    height?: number;
    headCircumference?: number;
  } | any;
  userRole?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canViewVitals?: boolean;
  weightHistory?: { value: number; date: string }[];
  heightHistory?: { value: number; date: string }[];
  headCircumferenceHistory?: { value: number; date: string }[];
  error?: string;
}

interface KidStore {
  kids: Kid[];
  addKid: (kid: Kid) => void;
  addKids: (newKids: Kid[]) => void;
  setKids: (kids: Kid[]) => void;
  refreshKids: (token: string) => Promise<void>;
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

        setKids: (kids: Kid[]) => {
          set({ kids: [...kids] }); // Create a new array to ensure reactivity
        },

        refreshKids: async (token: string) => {
          try {
            const { getMyKids, clearKidsCache } = await import('../api/kidApi');
            clearKidsCache(); // Clear any cached requests
            const kids = await getMyKids(token, true); // Force refresh
            set({ kids: kids ? [...kids] : [] }); // Ensure new array reference
          } catch (error) {
            console.error('❌ Failed to refresh kids:', error);
          }
        },

        removeKid: (id: string) =>
          set((state) => ({
            kids: state.kids.filter((k) => k.id !== id),
          })),

        clearKids: () => {
          set({ kids: [] });
        },
      }),
      {
        name: 'kids-storage',
        storage: {
          getItem: async (name: string) => {
            try {
              const value = await AsyncStorage.getItem(name);
              return value ? JSON.parse(value) : null;
            } catch (error) {
              console.error('Error reading from AsyncStorage:', error);
              return null;
            }
          },
          setItem: async (name: string, value: any) => {
            try {
              await AsyncStorage.setItem(name, JSON.stringify(value));
            } catch (error) {
              console.error('Error writing to AsyncStorage:', error);
            }
          },
          removeItem: async (name: string) => {
            try {
              await AsyncStorage.removeItem(name);
            } catch (error) {
              console.error('Error removing from AsyncStorage:', error);
            }
          },
        },
        partialize: (state: KidStore) => ({ kids: state.kids }),
        version: 2, // Increment version to force migration
      }
    ),
    { name: 'KidStore' }
  )
);
