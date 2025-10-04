import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import Constants from 'expo-constants';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async () => {
  try {
    // Get Web Client ID from app.json configuration
    const webClientId = Constants.expoConfig?.extra?.googleWebClientId;
    
    if (!webClientId) {
      throw new Error('Google Web Client ID not found. Please add googleWebClientId to your app.json extra configuration.');
    }

    console.log('🔍 Starting Google authentication...');
    console.log('🔍 Using Web Client ID for Expo Go/emulator');
    console.log('🔍 Web Client ID:', webClientId);

    // For Expo Go, use the Expo proxy redirect URI
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'exp',
    });

    console.log('🔍 Google Auth - Using redirect URI:', redirectUri);

    // Use implicit flow (Token response) which doesn't require client secret
    const request = new AuthSession.AuthRequest({
      clientId: webClientId,
      scopes: ['profile', 'email', 'openid'],
      redirectUri: redirectUri,
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false,
    });

    console.log('🔍 Google Auth - Using implicit flow (no client secret needed)...');

    // Prompt the user to authenticate
    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    console.log('🔍 Google Auth - Authentication result:', result?.type);

    if (result?.type === 'success') {
      const { id_token, access_token } = result.params;
      
      if (!id_token) {
        console.error('Response params:', result.params);
        throw new Error('No ID token received from Google');
      }

      console.log('🔍 Google Auth - ID token received successfully');

      // Create Firebase credential
      const googleCredential = GoogleAuthProvider.credential(id_token, access_token);

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