import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../config/firebase";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async () => {
  try {
    console.log("🔍 Starting Google Sign-In...");
    
    const webClientId = Constants.expoConfig?.extra?.googleWebClientId;

    if (!webClientId) {
      throw new Error(
        "Google Web Client ID not found. Please add googleWebClientId to your app.json extra configuration."
      );
    }

    const redirectUri = AuthSession.makeRedirectUri({
      native: "https://auth.expo.io/@daikifujii/xo-baby",
    });

    console.log("✅ Web Client ID:", webClientId);
    console.log("✅ Redirect URI:", redirectUri);
    console.log("⚠️  IMPORTANT: Add this redirect URI to Google Cloud Console:");
    console.log("   👉 Credentials > Web Client > Authorized redirect URIs");
    console.log("   👉 Add: xo-baby-app://redirect");

    const discovery = {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      // tokenEndpoint: "https://oauth2.googleapis.com/token",
    };

    const request = new AuthSession.AuthRequest({
      clientId: webClientId,
      scopes: ["profile", "email", "openid"],
      redirectUri: redirectUri,
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false,
      // extraParams: {
      //   access_type: "offline",
      // },
    });

    console.log("🔍 Auth Request Created");

    const result = await request.promptAsync(discovery);

    console.log("🔍 Auth Result Type:", result.type);

    if (result?.type === "success") {
      console.log("✅ Authentication successful!");
      
      const { id_token, access_token } = result.params;

      if (!id_token) {
        console.error("❌ Response params:", result.params);
        throw new Error("No ID token received from Google");
      }

      console.log("✅ ID Token received, signing in to Firebase...");

      const googleCredential = GoogleAuthProvider.credential(
        id_token,
        access_token
      );
      const userCredential = await signInWithCredential(auth, googleCredential);

      console.log("✅ Firebase sign-in successful:", userCredential.user.email);

      return {
        user: userCredential.user,
        userInfo: {
          givenName: userCredential.user.displayName?.split(" ")[0] || "",
          familyName:
            userCredential.user.displayName?.split(" ").slice(1).join(" ") ||
            "",
          email: userCredential.user.email || "",
          name: userCredential.user.displayName || "",
          photo: userCredential.user.photoURL || "",
        },
      };
    } else if (result.type === "cancel") {
      console.log("⚠️  User cancelled the login flow");
      throw new Error("User cancelled the login flow");
    } else if (result.type === "dismiss") {
      console.log("⚠️  User dismissed the login flow");
      throw new Error("User dismissed the login flow");
    } else {
      console.error("❌ Authentication failed with type:", result.type);
      throw new Error(`Authentication failed: ${result.type}`);
    }
  } catch (error: any) {
    console.error("❌ Google Sign-In Error:", error);
    throw new Error(`Google Sign-In failed: ${error.message}`);
  }
};

export const signOutFromGoogle = async () => {
  try {
    await auth.signOut();
    console.log("🔍 Google Sign-Out - User signed out");
  } catch (error) {
    console.error("Google Sign-Out Error:", error);
  }
};

export const getCurrentGoogleUser = async () => {
  return auth.currentUser
    ? {
        user: {
          name: auth.currentUser.displayName || "",
          email: auth.currentUser.email || "",
          photo: auth.currentUser.photoURL || "",
        },
      }
    : null;
};
