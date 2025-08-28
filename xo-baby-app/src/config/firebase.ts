import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import {
  FIREBASE_WEB_API_KEY,
  FIREBASE_WEB_AUTH_DOMAIN,
  FIREBASE_WEB_PROJECT_ID,
  FIREBASE_WEB_STORAGE_BUCKET,
  FIREBASE_WEB_MESSAGING_SENDER_ID,
  FIREBASE_WEB_APP_ID,
  FIREBASE_WEB_MEASUREMENT_ID,
} from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_WEB_API_KEY,
  authDomain: FIREBASE_WEB_AUTH_DOMAIN,
  projectId: FIREBASE_WEB_PROJECT_ID,
  storageBucket: FIREBASE_WEB_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_WEB_MESSAGING_SENDER_ID,
  appId: FIREBASE_WEB_APP_ID,
  measurementId: FIREBASE_WEB_MEASUREMENT_ID,
};

// app singleton
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// auth singleton: web -> getAuth; native -> initializeAuth (with AsyncStorage)
let _auth: Auth;
if (Platform.OS === 'web') {
  _auth = getAuth(app);
} else {
  try {
    // if it has already been created (e.g. after Fast Refresh)
    _auth = getAuth(app);
  } catch {
    _auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
}
export const auth = _auth;
