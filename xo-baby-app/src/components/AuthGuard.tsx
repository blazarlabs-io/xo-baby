import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useUserStore } from '../store/userStore';
import { auth } from '../config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#31CECE" />
      <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
        Checking authentication...
      </Text>
    </View>
  )
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        // User is authenticated and email is verified
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          token: '', // Will be set when needed
          role: 'parent' // Default role
        });
        setIsAuthenticated(true);
      } else {
        // No user or email not verified
        clearUser();
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [setUser, clearUser]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    // Redirect to welcome screen or show login prompt
    return null; // This will be handled by navigation
  }

  return <>{children}</>;
};

export default AuthGuard;
