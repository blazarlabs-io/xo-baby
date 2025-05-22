import { UserRole } from "../constants/roles";

export type AuthStackParamList = {
  Welcome: undefined;
  RoleSelection: undefined;
  LoginEmail: undefined;
  LoginPassword: { email: string };
  SignupNameScreen: undefined;
  SignupEmailScreen: { name: string };
  SignupPasswordScreen: { name: string; email: string };
  SignupConfirmPasswordScreen: { name: string; email: string; password: string };
  SignupEmailConfirmedScreen: undefined;
  SignupCheckEmailScreen: undefined
  EmailVerification: undefined;
  HomeScreen: undefined;
};
