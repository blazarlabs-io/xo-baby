import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { useUserStore } from '../store/userStore';

export default function RootNavigator() {
  const user = useUserStore((state) => state.user);
  //const user = { id: '1', name: 'John Doe', email: 'email.@mail.com' }; // Mock user for testing
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
