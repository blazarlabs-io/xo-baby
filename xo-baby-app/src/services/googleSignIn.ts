import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import Constants from 'expo-constants';

// Complete the auth session for Expo Go
WebBrowser.maybeCompleteAuthSession();

// Discovery document for Google OAuth
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export const signInWithGoogle = async () => {
  try {
    // Get the client ID from environment variables
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('Google Web Client ID not found. Please add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your environment variables.');
    }

    // Determine redirect URI based on the environment
    let redirectUri: string;
    
    // Check if running in a development build or standalone app
    const isStandalone = Constants.executionEnvironment === 'standalone';
    
    if (isStandalone) {
      // For development builds or standalone apps, use custom scheme
      redirectUri = AuthSession.makeRedirectUri({
        scheme: 'xo-baby-app',
        path: 'auth',
      });
    } else {
      // For Expo Go, use the proxy service
      redirectUri = AuthSession.makeRedirectUri();
    }

    console.log('🔍 Google Auth - Execution Environment:', Constants.executionEnvironment);
    console.log('🔍 Google Auth - Is Standalone:', isStandalone);
    console.log('🔍 Google Auth - Using redirect URI:', redirectUri);

    // Configure the request with proper parameters for Google OAuth 2.0 compliance
    const request = new AuthSession.AuthRequest({
      clientId: clientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri: redirectUri,
      extraParams: {
        nonce: Math.random().toString(36).substring(2, 15),
        prompt: 'select_account',
      },
    });

    console.log('🔍 Google Auth - Request configured with secure parameters');

    // Prompt the user to authenticate
    const result = await request.promptAsync(discovery);

    console.log('🔍 Google Auth - Authentication result:', result.type);

    if (result.type === 'success') {
      const { id_token } = result.params;
      
      if (!id_token) {
        throw new Error('No ID token received from Google');
      }

      console.log('🔍 Google Auth - ID token received successfully');

      // Create Firebase credential with the Google ID token
      const googleCredential = GoogleAuthProvider.credential(id_token);

      // Sign in with Firebase
      const userCredential = await signInWithCredential(auth, googleCredential);
      
      console.log('🔍 Firebase Auth - User signed in:', userCredential.user.uid);

      return {
        user: userCredential.user,
        userInfo: {
          // Extract user info from the Firebase user object
          givenName: userCredential.user.displayName?.split(' ')[0] || '',
          familyName: userCredential.user.displayName?.split(' ').slice(1).join(' ') || '',
          email: userCredential.user.email || '',
          name: userCredential.user.displayName || '',
          photo: userCredential.user.photoURL || '',
        },
      };
    } else if (result.type === 'cancel') {
      throw new Error('User cancelled the login flow');
    } else {
      throw new Error(`Authentication failed: ${result.type}`);
    }
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw new Error(`Google Sign-In failed: ${error.message}`);
  }
};

export const signOutFromGoogle = async () => {
  try {
    // For Expo AuthSession, we just need to sign out from Firebase
    await auth.signOut();
    console.log('🔍 Google Sign-Out - User signed out');
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
  }
};

// For Expo AuthSession, we don't have silent sign-in
export const getCurrentGoogleUser = async () => {
  // Return the current Firebase user if available
  return auth.currentUser ? {
    user: {
      name: auth.currentUser.displayName || '',
      email: auth.currentUser.email || '',
      photo: auth.currentUser.photoURL || '',
    }
  } : null;
}; 