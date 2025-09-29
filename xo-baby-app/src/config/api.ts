import axios from "axios";
import { Platform } from "react-native";
import { auth } from "./firebase";
import { useUserStore } from "../store/userStore";

const DEV_HOST = Platform.select({
  android: "64.227.35.231",
  ios: "localhost",
  default: "localhost",
});

// Use the same server for both dev and production for now
const BASE_URL = `https://xo-baby.blazarlabs.io`;
// const BASE_URL = `http://64.227.35.231:3000`;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 900000, // 15 minutes timeout to match nginx
  headers: { "Content-Type": "application/json" },
});

// attach token
api.interceptors.request.use(async (config) => {
  const token = useUserStore.getState().user?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

function resolveQueue(err: any, token: string | null) {
  queue.forEach(({ resolve, reject }) => {
    if (err) {
      reject(err);
    } else {
      resolve(token!);
    }
  });
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
        if (!user) throw new Error("Not authenticated");

        // force-refresh the Firebase ID token
        const newToken = await user.getIdToken(true);

        // update store
        const store = useUserStore.getState();
        store.setUser({
          ...(store.user ?? {
            uid: user.uid,
            email: user.email ?? "",
            role: "parent" as const,
          }),
          token: newToken,
        });

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
