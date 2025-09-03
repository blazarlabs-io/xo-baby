import { UserRole } from "../constants/roles";
import { Anomaly } from "./types";

export type AuthStackParamList = {
  Welcome: undefined;
  RoleSelection: undefined;
  LoginEmail: undefined;
  LoginPassword: { email: string };
  SignupNameScreen: undefined;
  SignupEmailScreen: { name: string };
  SignupPasswordScreen: { name: string; email: string };
  SignupConfirmPasswordScreen: {
    name: string;
    email: string;
    password: string;
  };
  SignupEmailConfirmedScreen: undefined;
  SignupCheckEmailScreen: undefined;
  EmailVerification: undefined;
};

export type AppStackParamList = {
  HomeScreen: undefined;
  AddKid: undefined;
  AddKidName: undefined;
  KidProfile: { kidId: string };
  AddKidLastName: { firstName: string };
  AddKidGender: { firstName: string; lastName: string };
  AddKidBirthday: { firstName: string; lastName: string; gender: string };
  AddKidBloodType: {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
  };
  AddKidEthnicity: {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
    bloodtype: string;
  };
  AddKidLocation: {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
    bloodtype: string;
    ethnicity: string;
  };
  AddKidAnomalies: {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
    bloodtype: string;
    ethnicity: string;
    location: string;
  };
  AddKidAvatar: {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
    bloodtype: string;
    ethnicity: string;
    location: string;
    anomalies: Anomaly[];
  };
  RealTimeData: { kidId: string };
  Development: { kidId: string };
  Tasks: { kidId: string };
  Notes: { kidId: string };
  Devices: { kidId: string };
  DeviceItem: { kidId: string };
  DeviceAdd: undefined;
};
