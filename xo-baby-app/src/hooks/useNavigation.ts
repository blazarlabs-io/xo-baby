import { useNavigation as useReactNavigation } from "@react-navigation/native";
import { useUserStore } from "../store/userStore";
import { NavigationService } from "../services/navigationService";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";

// Custom navigation hook that provides additional functionality
export const useNavigation = () => {
  const navigation = useReactNavigation();
  const { user, clearUser } = useUserStore();

  // Enhanced navigation functions
  const enhancedNavigation = {
    // Basic navigation
    navigate: navigation.navigate,
    goBack: navigation.goBack,
    reset: navigation.reset,
    canGoBack: navigation.canGoBack,

    // Auth-specific navigation
    navigateToWelcome: () => NavigationService.navigateToWelcome(),
    navigateToLogin: () => NavigationService.navigateToLoginEmail(),
    navigateToSignup: () => NavigationService.navigateToSignupName(),
    navigateToHome: () => NavigationService.navigateToHome(),

    // App-specific navigation
    navigateToAddKid: () => NavigationService.navigateToAddKid(),
    navigateToKidProfile: (kidId: string) =>
      NavigationService.navigateToKidProfile(kidId),
    navigateToRealTimeData: (kidId: string) =>
      NavigationService.navigateToRealTimeData(kidId),
    navigateToDevelopment: (kidId: string) =>
      NavigationService.navigateToDevelopment(kidId),
    navigateToTasks: (kidId: string) =>
      NavigationService.navigateToTasks(kidId),
    navigateToNotes: (kidId: string) =>
      NavigationService.navigateToNotes(kidId),
    navigateToDevices: (kidId: string) =>
      NavigationService.navigateToDevices(kidId),

    // Utility navigation
    resetToWelcome: () => NavigationService.resetToWelcome(),
    resetToHome: () => NavigationService.resetToHome(),

    // Authentication functions
    logout: async () => {
      try {
        await signOut(auth);
        clearUser();
        NavigationService.resetToWelcome();
      } catch (error) {
        console.error("Logout error:", error);
      }
    },

    // Check if user can access certain routes
    canAccessRoute: (routeName: string) => {
      if (!user) return false;

      // Add any route-specific access control logic here
      switch (routeName) {
        case "AddKid":
        case "KidProfile":
        case "RealTimeData":
          return user.role === "parent" || user.role === "medical";
        case "Settings":
        case "Profile":
          return true; // All authenticated users can access
        default:
          return true;
      }
    },

    // Get current user info
    currentUser: user,
    isAuthenticated: !!user,
    isEmailVerified: auth.currentUser?.emailVerified || false,
  };

  return enhancedNavigation;
};

// Re-export the original hook for cases where you need the basic navigation
export { useReactNavigation as useBasicNavigation };

export default useNavigation;
