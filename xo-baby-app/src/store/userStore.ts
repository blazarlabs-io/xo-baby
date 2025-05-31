import { create } from 'zustand'
// import { persist } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  uid: string;
  email: string;
  token: string;
}

export interface Kid {
  id: string;
  parentId: string;
  name: string;
  birthDate: string;
  vitals: {
    heartRate: number;
    oximetry: number;
  };
}

interface UserStore {
  user: User | null;
  kids: Kid[];
  setUser: (user: User) => void;
  clearUser: () => void;
  addKid: (kid: Kid) => void;
  clearKids: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  kids: [],

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null, kids: [] }),

  addKid: (kid) =>
    set((state) => ({ kids: [...state.kids, kid] })),

  clearKids: () => set({ kids: [] }),
}));

// export const useUserStore = create<UserStore>()(
//   persist(
//     (set) => ({
//       user: null,
//       setUser: (user) => set({ user }),
//       clearUser: () => set({ user: null }),
//     }),
//     {
//       name: 'user-storage',
//       storage: {
//         getItem: async (name) => {
//           const value = await AsyncStorage.getItem(name);
//           return value ? JSON.parse(value) : null; // parsed
//         },
//         setItem: async (name, value) => {
//           await AsyncStorage.setItem(name, JSON.stringify(value)); // stringified
//         },
//         removeItem: async (name) => {
//           await AsyncStorage.removeItem(name);
//         },
//       },
//     }
//   )
// );
