
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useCallback } from 'react';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';

type User = import('firebase/auth').User;

const ANDROID_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!;
const googleScheme =
  'com.googleusercontent.apps.' + ANDROID_ID.replace('.apps.googleusercontent.com', '');

const redirectUri = `${googleScheme}:/oauth2redirect/google`;

export function useGoogleSignIn(opts?: {
  onSuccess?: (user: User) => void | Promise<void>;
  onError?: (err: any) => void;
}) {
  const isExpoGo = Constants.appOwnership === 'expo';


  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  const start = useCallback(async () => {
    if (!request) return;
    await promptAsync({ useProxy: false });
  }, [request, promptAsync]);

  useEffect(() => {
    (async () => {
      try {
        if (response?.type !== 'success') return;
        const { id_token } = response.params;
        if (!id_token) throw new Error('No ID token from Google');

        // Firebase sign-in
        const credential = GoogleAuthProvider.credential(id_token);
        const userCred = await signInWithCredential(auth, credential);
        await opts?.onSuccess?.(userCred.user);
      } catch (e) {
        opts?.onError?.(e);
      }
    })();
  }, [response]);

  return { start, loading: !request, isExpoGo };
}
