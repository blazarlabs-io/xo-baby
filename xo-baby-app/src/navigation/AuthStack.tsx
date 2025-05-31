import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RoleSelectionScreen from '../screens/onboarding/RoleSelectionScreen';
import LoginEmailScreen from '../screens/auth/login/LoginEmailScreen';
import LoginPasswordScreen from '../screens/auth/login/LoginPasswordScreen';
import SignupNameScreen from '../screens/auth/signup/SignupNameScreen';
import SignupEmailScreen from '../screens/auth/signup/SignupEmailScreen';   
import SignupPasswordScreen from '../screens/auth/signup/SignupPasswordScreen';
import SignupConfirmPasswordScreen from '../screens/auth/signup/SignupConfirmPasswordScreen';
import SignupCheckEmailScreen from '../screens/auth/signup/SignupCheckEmailScreen';
import SignupEmailConfirmedScreen from '../screens/auth/signup/SignupEmailConfirmedScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import type { AuthStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="LoginEmail" component={LoginEmailScreen} />
      <Stack.Screen name="LoginPassword" component={LoginPasswordScreen} />
      <Stack.Screen name="SignupNameScreen" component={SignupNameScreen} />
      <Stack.Screen name="SignupEmailScreen" component={SignupEmailScreen} />
      <Stack.Screen name="SignupPasswordScreen" component={SignupPasswordScreen} />
      <Stack.Screen name="SignupConfirmPasswordScreen" component={SignupConfirmPasswordScreen} />
      <Stack.Screen name="SignupEmailConfirmedScreen" component={SignupEmailConfirmedScreen} />
      <Stack.Screen name="SignupCheckEmailScreen" component={SignupCheckEmailScreen} />
    </Stack.Navigator>
  );
}
