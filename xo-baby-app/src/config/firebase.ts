import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence, type Auth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// TODO: Replace with your actual Firebase configuration
// You can find these values in your Firebase Console -> Project Settings -> General tab
const firebaseConfig = {
  apiKey: "AIzaSyDYfbxdqmUl9jc5LPQI031zmAMwX3cueqc",
  authDomain: "xo-baby-blockchain.firebaseapp.com",
  projectId: "xo-baby-blockchain",
  storageBucket: "xo-baby-blockchain.firebasestorage.app",
  messagingSenderId: "278376901127",
  appId: "1:278376901127:web:9fea96c9f5587503d718a2",
  measurementId: "G-BX9SSC0N6L",
};

// app singleton
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// auth singleton: web -> getAuth; native -> initializeAuth (with AsyncStorage)
let _auth: Auth;

function getOrInitializeAuth(): Auth {
  if (Platform.OS === "web") {
    return getAuth(app);
  }
  
  // For React Native: ALWAYS try initializeAuth FIRST with AsyncStorage persistence
  // This is the correct way to set up Firebase Auth in React Native
  try {
    // Try to initialize with persistence - this is the first/correct call
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // If initializeAuth throws (e.g., already initialized during Fast Refresh),
    // then we can safely use getAuth
    console.log("Auth already initialized, using existing instance");
    return getAuth(app);
  }
}

_auth = getOrInitializeAuth();

export const auth = _auth;
