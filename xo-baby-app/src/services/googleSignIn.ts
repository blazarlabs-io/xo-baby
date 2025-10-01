import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async () => {
  try {
    // For native Android builds, use Android Client ID
    // For web/Expo Go, use Web Client ID
    const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    
    // Use Android Client ID if available (for native builds)
    const clientId = androidClientId || webClientId;
    
    if (!clientId) {
      throw new Error('Google Client ID not found. Please add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID or EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your environment variables.');
    }

    console.log('🔍 Starting Google authentication...');
    console.log('🔍 Using Client ID type:', androidClientId ? 'Android' : 'Web');

    // For Android Client ID, use reverse client ID format
    // For Web Client ID, use Expo proxy
    const redirectUri = androidClientId 
      ? `com.googleusercontent.apps.${androidClientId.split('-')[0]}:/oauth2redirect`
      : AuthSession.makeRedirectUri();

    console.log('🔍 Google Auth - Using redirect URI:', redirectUri);

    // Use implicit flow (Token response) which doesn't require client secret
    const request = new AuthSession.AuthRequest({
      clientId: clientId,
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