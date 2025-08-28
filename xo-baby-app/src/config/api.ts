import axios from 'axios';
import { Platform } from 'react-native';
import { auth } from './firebase';
import { useUserStore } from '../store/userStore';

const DEV_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});
const BASE_URL = __DEV__
  ? `http://${DEV_HOST}:${process.env.API_PORT}`
  : (process.env.EXPO_PUBLIC_API_URL as string);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// attach token
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().user?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: { resolve: (t: string) => void; reject: (e: any) => void }[] = [];

function resolveQueue(err: any, token: string | null) {
  queue.forEach(p => (err ? p.reject(err) : p.resolve(token as string)));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        // force-refresh the Firebase ID token
        const newToken = await user.getIdToken(true);

        // update store
        const store = useUserStore.getState();
        store.setUser({ ...(store.user ?? { uid: user.uid, email: user.email ?? '' }), token: newToken });

        resolveQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        resolveQueue(err, null);
        // optional: store.clearUser();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
