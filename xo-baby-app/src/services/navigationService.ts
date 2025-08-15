import React from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import type {
  AuthStackParamList,
  AppStackParamList,
} from "../types/navigation";

// Type for the combined navigation
export type RootNavigationProp = NavigationProp<
  AuthStackParamList & AppStackParamList
>;

// Navigation service class for programmatic navigation
export class NavigationService {
  private static navigator: RootNavigationProp | null = null;

  static setNavigator(navigator: RootNavigationProp) {
    NavigationService.navigator = navigator;
  }

  // Auth Stack Navigation
  static navigateToWelcome() {
    NavigationService.navigator?.navigate("Welcome" as any);
  }

  static navigateToRoleSelection() {
    NavigationService.navigator?.navigate("RoleSelection" as any);
  }

  static navigateToLoginEmail() {
    NavigationService.navigator?.navigate("LoginEmail" as any);
  }

  static navigateToLoginPassword(email: string) {
    NavigationService.navigator?.navigate("LoginPassword" as any, { email });
  }

  static navigateToSignupName() {
    NavigationService.navigator?.navigate("SignupNameScreen" as any);
  }

  static navigateToSignupEmail(name: string) {
    NavigationService.navigator?.navigate("SignupEmailScreen" as any, { name });
  }

  static navigateToSignupPassword(name: string, email: string) {
    NavigationService.navigator?.navigate("SignupPasswordScreen" as any, {
      name,
      email,
    });
  }

  static navigateToSignupConfirmPassword(
    name: string,
    email: string,
    password: string
  ) {
    NavigationService.navigator?.navigate(
      "SignupConfirmPasswordScreen" as any,
      { name, email, password }
    );
  }

  static navigateToSignupCheckEmail() {
    NavigationService.navigator?.navigate("SignupCheckEmailScreen" as any);
  }

  static navigateToSignupEmailConfirmed() {
    NavigationService.navigator?.navigate("SignupEmailConfirmedScreen" as any);
  }

  // App Stack Navigation
  static navigateToHome() {
    NavigationService.navigator?.navigate("Tabs" as any);
  }

  static navigateToAddKid() {
    NavigationService.navigator?.navigate("AddKid" as any);
  }

  static navigateToKidProfile(kidId: string) {
    NavigationService.navigator?.navigate("KidProfile" as any, { kidId });
  }

  static navigateToRealTimeData(kidId: string) {
    NavigationService.navigator?.navigate("RealTimeData" as any, { kidId });
  }

  static navigateToDevelopment(kidId: string) {
    NavigationService.navigator?.navigate("Development" as any, { kidId });
  }

  static navigateToTasks(kidId: string) {
    NavigationService.navigator?.navigate("Tasks" as any, { kidId });
  }

  static navigateToNotes(kidId: string) {
    NavigationService.navigator?.navigate("Notes" as any, { kidId });
  }

  static navigateToDevices(kidId: string) {
    NavigationService.navigator?.navigate("Devices" as any, { kidId });
  }

  // Utility Navigation
  static goBack() {
    NavigationService.navigator?.goBack();
  }

  static resetToWelcome() {
    NavigationService.navigator?.reset({
      index: 0,
      routes: [{ name: "Welcome" as any }],
    });
  }

  static resetToHome() {
    NavigationService.navigator?.reset({
      index: 0,
      routes: [{ name: "Tabs" as any }],
    });
  }
}

// Hook for using navigation in components
export const useAppNavigation = () => {
  const navigation = useNavigation<RootNavigationProp>();

  // Set the navigator in the service when this hook is used
  React.useEffect(() => {
    NavigationService.setNavigator(navigation);
  }, [navigation]);

  return navigation;
};

// Re-export the hook for easier imports
export { useAppNavigation as useNavigation };
