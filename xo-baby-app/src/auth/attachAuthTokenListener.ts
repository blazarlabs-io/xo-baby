import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useUserStore } from '../store/userStore';

export function attachAuthTokenListener() {
  return onIdTokenChanged(auth, async (fbUser) => {
    if (!fbUser) {
      useUserStore.getState().clearUser?.();
      return;
    }
    const token = await fbUser.getIdToken(); // non-forced; background refresh
    const current = useUserStore.getState().user;
    useUserStore.getState().setUser({
      uid: fbUser.uid,
      email: fbUser.email ?? current?.email ?? '',
      token,
      role: current?.role ?? 'parent',
    });
  });
}
