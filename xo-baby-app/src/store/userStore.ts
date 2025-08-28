import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Role
import { UserRole } from '../constants/roles'

export interface User {
  uid: string;
  email: string;
  token: string;
  role: UserRole
}


interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateToken: (token: string) => void;
}


export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null }),
        // Only updates the token while preserving other fields
        updateToken: (token) =>
        set((state) =>
          state.user
            ? { user: { ...state.user, token } }
            : state
        ),
      }),
      {
        name: 'user-storage',
        storage: {
          getItem: async (name) => {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null; // parsed
          },
          setItem: async (name, value) => {
            await AsyncStorage.setItem(name, JSON.stringify(value)); // stringified
          },
          removeItem: async (name) => {
            await AsyncStorage.removeItem(name);
          },
        },
      }
    ),
    {name: 'UserStore'},
  )
);
