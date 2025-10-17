import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SystemStore {
  isConnectedDevice: boolean;
  setIsConnectedDevice: (value: boolean) => void;
  toggleConnectionDevice: () => void;
}

export const useSystemStore = create<SystemStore>()(
  devtools(
    persist(
      (set) => ({
        isConnectedDevice: false,
        setIsConnectedDevice: (value) => set({ isConnectedDevice: value }),
        toggleConnectionDevice: () =>
          set((state) => ({ isConnectedDevice: !state.isConnectedDevice })),
      }),
      {
        name: 'system-storage',
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  )
);
