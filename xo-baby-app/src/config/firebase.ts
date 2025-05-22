import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
