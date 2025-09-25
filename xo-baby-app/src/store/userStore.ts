import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '../constants/roles'

export interface User {
  uid: string;
  email: string;
  token: string;
  role: UserRole
}

interface UserStore {
  user: User | null;
  selectedRole: UserRole | null; // Temporary role storage for auth flow
  setUser: (user: User) => void;
  clearUser: () => void;
  updateToken: (token: string) => void;
  setSelectedRole: (role: UserRole) => void;
  clearSelectedRole: () => void;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        selectedRole: null,
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null }),
        updateToken: (token) =>
        set((state) =>
          state.user
            ? { user: { ...state.user, token } }
            : state
        ),
        setSelectedRole: (role) => set({ selectedRole: role }),
        clearSelectedRole: () => set({ selectedRole: null }),
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
