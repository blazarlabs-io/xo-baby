import { create } from 'zustand'
// import { persist } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  uid: string;
  email: string;
  token: string;
}


interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
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
