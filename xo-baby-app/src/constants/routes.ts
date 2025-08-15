// Route names for the entire application
export const ROUTES = {
  // Auth Stack Routes
  AUTH: {
    WELCOME: "Welcome",
    ROLE_SELECTION: "RoleSelection",
    LOGIN_EMAIL: "LoginEmail",
    LOGIN_PASSWORD: "LoginPassword",
    SIGNUP_NAME: "SignupNameScreen",
    SIGNUP_EMAIL: "SignupEmailScreen",
    SIGNUP_PASSWORD: "SignupPasswordScreen",
    SIGNUP_CONFIRM_PASSWORD: "SignupConfirmPasswordScreen",
    SIGNUP_CHECK_EMAIL: "SignupCheckEmailScreen",
    SIGNUP_EMAIL_CONFIRMED: "SignupEmailConfirmedScreen",
    EMAIL_VERIFICATION: "EmailVerification",
  },

  // App Stack Routes
  APP: {
    TABS: "Tabs",
    HOME: "HomeScreen",
    ADD_KID: "AddKid",
    ADD_KID_NAME: "AddKidName",
    ADD_KID_LAST_NAME: "AddKidLastName",
    ADD_KID_GENDER: "AddKidGender",
    ADD_KID_BIRTHDAY: "AddKidBirthday",
    ADD_KID_BLOOD_TYPE: "AddKidBloodType",
    ADD_KID_ETHNICITY: "AddKidEthnicity",
    ADD_KID_LOCATION: "AddKidLocation",
    ADD_KID_ANOMALIES: "AddKidAnomalies",
    ADD_KID_AVATAR: "AddKidAvatar",
    KID_PROFILE: "KidProfile",
    REAL_TIME_DATA: "RealTimeData",
    DEVELOPMENT: "Development",
    TASKS: "Tasks",
    NOTES: "Notes",
    DEVICES: "Devices",
    DEVICE_ITEM: "DeviceItem",
    DEVICE_ADD: "DeviceAdd",
  },

  // Tab Routes
  TABS: {
    HOME: "Home",
    KIDS: "Kids",
    PROFILE: "Profile",
    SETTINGS: "Settings",
  },
} as const;

// Type for route names
export type RouteName =
  | (typeof ROUTES.AUTH)[keyof typeof ROUTES.AUTH]
  | (typeof ROUTES.APP)[keyof typeof ROUTES.APP]
  | (typeof ROUTES.TABS)[keyof typeof ROUTES.TABS];

// Route parameters types
export interface RouteParams {
  [ROUTES.AUTH.LOGIN_PASSWORD]: { email: string };
  [ROUTES.AUTH.SIGNUP_EMAIL]: { name: string };
  [ROUTES.AUTH.SIGNUP_PASSWORD]: { name: string; email: string };
  [ROUTES.AUTH.SIGNUP_CONFIRM_PASSWORD]: {
    name: string;
    email: string;
    password: string;
  };
  [ROUTES.APP.KID_PROFILE]: { kidId: string };
  [ROUTES.APP.REAL_TIME_DATA]: { kidId: string };
  [ROUTES.APP.DEVELOPMENT]: { kidId: string };
  [ROUTES.APP.TASKS]: { kidId: string };
  [ROUTES.APP.NOTES]: { kidId: string };
  [ROUTES.APP.DEVICES]: { kidId: string };
  [ROUTES.APP.DEVICE_ITEM]: { kidId: string };
  [ROUTES.APP.ADD_KID_LAST_NAME]: { firstName: string };
  [ROUTES.APP.ADD_KID_GENDER]: { firstName: string; lastName: string };
  [ROUTES.APP.ADD_KID_BIRTHDAY]: {
    firstName: string;
    lastName: string;
    gender: string;
  };
  [ROUTES.APP.ADD_KID_BLOOD_TYPE]: {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
  };
  [ROUTES.APP.ADD_KID_ETHNICITY]: {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
    bloodtype: string;
  };
  [ROUTES.APP.ADD_KID_LOCATION]: {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
    bloodtype: string;
    ethnicity: string;
  };
  [ROUTES.APP.ADD_KID_ANOMALIES]: {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
    bloodtype: string;
    ethnicity: string;
    location: string;
  };
  [ROUTES.APP.ADD_KID_AVATAR]: {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
    bloodtype: string;
    ethnicity: string;
    location: string;
    anomalies: any[];
  };
}

export default ROUTES;
