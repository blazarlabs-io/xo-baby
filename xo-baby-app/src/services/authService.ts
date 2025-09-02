import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { createUser, getUserRole } from "../api/userApi";
import type { UserRole } from "@/constants/roles";

export interface AuthUser {
  uid: string;
  email: string;
  token: string;
  role: UserRole;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signUp(data: SignupData): Promise<AuthUser> {
    try {
      console.log("🚀 Starting user signup process...", { email: data.email });

      // First, check if user already exists in Firebase
      try {
        const existingUser = await this.getCurrentUser();
        if (existingUser && existingUser.email === data.email) {
          console.log(
            "⚠️ User already exists in Firebase, checking verification status..."
          );

          // If user exists but email not verified, resend verification
          if (!existingUser.emailVerified) {
            await sendEmailVerification(existingUser);
            console.log("✅ Email verification resent to existing user");

            return {
              uid: existingUser.uid,
              email: existingUser.email || "",
              token: await existingUser.getIdToken(),
              role: "parent" as UserRole,
            };
          }
        }
      } catch (error) {
        console.log("No existing user found, proceeding with new signup...");
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      console.log("✅ Firebase user created successfully:", user.uid);

      // Send email verification
      await sendEmailVerification(user);
      console.log("✅ Email verification sent");

      // Try to create user in backend (but don't fail if it conflicts)
      try {
        console.log("🔄 Creating user in backend...");
        const backendResponse = await createUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        });
        console.log("✅ Backend user creation successful:", backendResponse);
      } catch (backendError: any) {
        console.error("❌ Backend user creation failed:", backendError);

        // If it's an "email already in use" error, that's expected
        // since we just created the user in Firebase Auth
        if (backendError.response?.data?.message?.includes("already in use")) {
          console.log(
            "⚠️ Expected backend conflict - user already exists in Firebase Auth"
          );
        } else {
          // Log other errors for debugging
          if (backendError.response) {
            console.error("Backend Error Details:", {
              status: backendError.response.status,
              statusText: backendError.response.statusText,
              data: backendError.response.data,
            });
          } else if (backendError.request) {
            console.error("Backend Request Error:", {
              message: backendError.message,
              code: backendError.code,
            });
          } else {
            console.error("Backend Error:", backendError.message);
          }
        }

        console.log("⚠️ Continuing with Firebase user only...");
      }

      // Get ID token
      const idToken = await user.getIdToken();
      console.log("✅ ID token obtained");

      // Fetch user role from backend
      let userRole: UserRole = "parent"; // default role
      try {
        const roleResponse = await getUserRole(user.uid, idToken);
        userRole = roleResponse.role;
      } catch (error) {
        console.log("⚠️ Could not fetch user role, using default:", error);
      }

      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email || "",
        token: idToken,
        role: userRole,
      };

      console.log("🎉 User signup completed successfully:", authUser);
      return authUser;
    } catch (error: any) {
      console.error("❌ Sign up failed:", error);
      console.log("🚀 Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(data: LoginData): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // Fetch user role from backend
      let userRole: UserRole = "parent"; // default role
      try {
        const roleResponse = await getUserRole(user.uid, idToken);
        userRole = roleResponse.role;
      } catch (error) {
        console.log("⚠️ Could not fetch user role, using default:", error);
      }

      return {
        uid: user.uid,
        email: user.email || "",
        token: idToken,
        role: userRole,
      };
    } catch (error: any) {
      console.error("Sign in failed:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with Google
   */
  static async signInWithGoogle(): Promise<AuthUser> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
        login_hint: "",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const idToken = await user.getIdToken();

        // Fetch user role from backend
        let userRole: UserRole = "parent"; // default role
        try {
          const roleResponse = await getUserRole(user.uid, idToken);
          userRole = roleResponse.role;
        } catch (error) {
          console.log("⚠️ Could not fetch user role, using default:", error);
        }

        return {
          uid: user.uid,
          email: user.email || "",
          token: idToken,
          role: userRole,
        };
      }

      throw new Error("Google sign in failed");
    } catch (error: any) {
      console.error("Google sign in failed:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Sign out failed:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Password reset failed:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Resend email verification
   */
  static async resendEmailVerification(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
      } else {
        throw new Error("No user is currently signed in");
      }
    } catch (error: any) {
      console.error("Email verification resend failed:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if email is verified
   */
  static isEmailVerified(): boolean {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("❌ No current user found for email verification check");
      return false;
    }

    const isVerified = currentUser.emailVerified;
    console.log(
      `📧 Email verification status for ${currentUser.email}: ${
        isVerified ? "VERIFIED" : "NOT VERIFIED"
      }`
    );
    return isVerified;
  }

  /**
   * Check if current user's email is verified (async version)
   */
  static async checkEmailVerificationStatus(): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log("❌ No current user found for email verification check");
        return false;
      }

      // Reload user to get latest verification status
      await currentUser.reload();

      const isVerified = currentUser.emailVerified;
      console.log(
        `📧 Email verification status for ${currentUser.email}: ${
          isVerified ? "VERIFIED" : "NOT VERIFIED"
        }`
      );
      return isVerified;
    } catch (error) {
      console.error("❌ Error checking email verification status:", error);
      return false;
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Handle Firebase authentication errors
   */
  private static handleAuthError(error: any): Error {
    let message = "Authentication failed. Please try again.";

    switch (error.code) {
      case "auth/user-not-found":
        message = "No account found with this email address.";
        break;
      case "auth/wrong-password":
        message = "Incorrect password. Please try again.";
        break;
      case "auth/invalid-email":
        message = "Invalid email address.";
        break;
      case "auth/weak-password":
        message = "Password is too weak. Please choose a stronger password.";
        break;
      case "auth/email-already-in-use":
        message = "An account with this email already exists.";
        break;
      case "auth/too-many-requests":
        message = "Too many failed attempts. Please try again later.";
        break;
      case "auth/user-disabled":
        message = "This account has been disabled.";
        break;
      case "auth/network-request-failed":
        message = "Network error. Please check your connection and try again.";
        break;
      case "auth/popup-closed-by-user":
        message = "Sign in was cancelled.";
        break;
      case "auth/popup-blocked":
        message = "Pop-up was blocked. Please allow pop-ups and try again.";
        break;
      default:
        if (error.message) {
          message = error.message;
        }
    }

    return new Error(message);
  }
}

export default AuthService;
