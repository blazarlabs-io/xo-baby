import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { useUserStore } from '@/store/userStore';
import { useKidStore } from '@/store/kidStore';

export default function RootNavigator() {
  const user = useUserStore((state) => state.user);
  const kids = useKidStore(s => s.kids);

  useEffect(() => {
    console.log('USER changed:', user);
  }, [user]);

  useEffect(() => {
    console.log('KIDS changed:', kids);
  }, [kids]);
  
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
