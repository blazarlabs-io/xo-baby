import React from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useUserStore } from '../store/userStore';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { NavigationService } from '../services/navigationService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireEmailVerification?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  requireEmailVerification = true,
}) => {
  const { user, clearUser } = useUserStore();

  // Check if user is authenticated
  if (!user) {
    return (
      fallback || (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E2F3F3' }}>
          <Text style={{ fontSize: 18, color: '#666', marginBottom: 20, textAlign: 'center' }}>
            You need to be logged in to access this page
          </Text>
          <Pressable
            style={{
              backgroundColor: '#31CECE',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 25,
            }}
            onPress={() => NavigationService.navigateToWelcome()}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Go to Login
            </Text>
          </Pressable>
        </View>
      )
    );
  }

  // Check if email verification is required and user is verified
  if (requireEmailVerification && auth.currentUser && !auth.currentUser.emailVerified) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E2F3F3' }}>
        <Text style={{ fontSize: 18, color: '#666', marginBottom: 20, textAlign: 'center' }}>
          Please verify your email address to continue
        </Text>
        <Pressable
          style={{
            backgroundColor: '#31CECE',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 25,
            marginBottom: 12,
          }}
          onPress={() => NavigationService.navigateToSignupCheckEmail()}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Check Email Verification
          </Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: '#FF6B6B',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 25,
          }}
          onPress={async () => {
            try {
              await signOut(auth);
              clearUser();
              NavigationService.resetToWelcome();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Logout
          </Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
