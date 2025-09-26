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
      (set, get) => ({
        user: null,
        selectedRole: null,
        setUser: (user) => {
          console.log("🔍 UserStore - Setting user:", user);
          set({ user });
        },
        clearUser: () => set({ user: null }),
        updateToken: (token) =>
          set((state) => {
            if (state.user) {
              console.log("🔍 UserStore - Updating token, preserving role:", state.user.role);
              return { user: { ...state.user, token } };
            }
            return state;
          }),
        setSelectedRole: (role) => set({ selectedRole: role }),
        clearSelectedRole: () => set({ selectedRole: null }),
      }),
      {
        name: 'user-storage',
        storage: {
          getItem: async (name) => {
            const value = await AsyncStorage.getItem(name);
            const parsed = value ? JSON.parse(value) : null;
            console.log("🔍 UserStore - Loading from storage:", parsed);
            return parsed;
          },
          setItem: async (name, value) => {
            console.log("🔍 UserStore - Saving to storage:", value);
            await AsyncStorage.setItem(name, JSON.stringify(value));
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
