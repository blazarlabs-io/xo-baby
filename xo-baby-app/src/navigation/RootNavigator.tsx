import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { useUserStore } from '../store/userStore';
import { auth } from '../config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        try {
          // Get the ID token for the authenticated user
          const idToken = await firebaseUser.getIdToken();

          // User is authenticated and email is verified
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            token: idToken, // Set the actual ID token
            role: 'parent' // Default role
          });
          console.log('✅ User authenticated and token set:', firebaseUser.uid);
        } catch (error) {
          console.error('❌ Error getting ID token:', error);
          clearUser();
        }
      } else {
        // No user or email not verified
        clearUser();
        console.log('❌ User not authenticated or email not verified');
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [setUser, clearUser]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E2F3F3' }}>
        <ActivityIndicator size="large" color="#31CECE" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
