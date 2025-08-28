import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';

import { auth } from '@/config/firebase';
import { useUserStore } from '@/store/userStore';
import { useKidStore } from '@/store/kidStore';

// The established persistence keys in the stores
const USER_PERSIST_KEY = 'user-storage';
const KIDS_PERSIST_KEY = 'kids-storage';

export async function logoutAll() {
  // 1) Firebase signOut (we ignore the error if the user is not logged in)
  try {
    await signOut(auth);
  } catch {}

  // 2) We clean the in-memory state (Zustand)
  const { clearUser } = useUserStore.getState();
  clearUser?.();

  const { clearKids } = useKidStore.getState();
  clearKids?.();

  // 3) We clean the persistence (Zustand/persist) - we delete the keys from AsyncStorage
  await AsyncStorage.multiRemove([USER_PERSIST_KEY, KIDS_PERSIST_KEY]);

  // 4) (optional) if you use interceptors or caches, clear them here
  // ex: queryClient.clear();
}