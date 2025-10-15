import React, { useEffect } from 'react';
import { View, Text, Image, Pressable, Alert } from 'react-native';
import { styles } from './WelcomeScreen.styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation'; 
import { useKidStore } from '../../store/kidStore';
import { useUserStore } from '../../store/userStore';
import type { UserRole } from '@/constants/roles';

import { useGoogleSignIn   } from '../../services/googleSignIn';
import { auth } from '../../config/firebase';

import * as AuthSession from 'expo-auth-session';

export default function WelcomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Welcome'>>();
    const kids = useKidStore((state) => state.kids);
    const { setUser, selectedRole, clearSelectedRole } = useUserStore();
    const user = useUserStore((state) => state.user);


   const handleLogin = () => {
       navigation.navigate('LoginEmail');
   };

   const handleSignup = () => {
       navigation.navigate('SignupNameScreen');
   }


const { start, loading } = useGoogleSignIn({
    onSuccess: async (firebaseUser) => {
      try {
        const token = await firebaseUser.getIdToken();

        const check = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/verify-token`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (check.ok) {
          const userProfile = await check.json();
          const finalRole: UserRole = userProfile.role || selectedRole || ('parent' as UserRole);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email ?? '', token, role: finalRole });
          clearSelectedRole();
        } else {
          const userRole: UserRole = (selectedRole || 'parent') as UserRole;
          await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/create-google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              email: firebaseUser.email,
              uid: firebaseUser.uid,
              role: userRole,
            }),
          });
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email ?? '', token, role: userRole });
          clearSelectedRole();
        }
      } catch (e: any) {
        Alert.alert('Google Sign-In Failed', e?.message || 'Please try again.');
      }
    },
    onError: (err) => {
      console.error('Google Sign-In error:', err);
      Alert.alert('Google Sign-In Failed', err?.message || 'Please try again.');
    },
  });

  const handleGoogleLogin = async () => {
    await start();
  };

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../../../assets/welcome/mama.png')} style={{ width: 251, height: 254 }} />
      </View>
      <Text style={styles.title}>Get Started</Text>

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Text style={styles.forgot}>Forgot your password?</Text>

      <Text style={styles.or}>Or</Text>

     <Pressable style={styles.socialButton} onPress={handleGoogleLogin}>
        <View style={styles.socialButtonContent}>
          <Image
            source={require('../../../assets/common/google-icon.png')}
            style={styles.socialIcon}
            resizeMode="cover"
          />
          <Text style={styles.socialText}>Sign In With Google</Text>
        </View>
      </Pressable>

      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }} >
        <Text style={styles.signupText}> Don't have an account? </Text>
        <Text style={styles.signupLink} onPress={handleSignup}>Sign Up</Text>
      </View>
        
      <Text style={styles.termsText}>
        By creating an account or logging in you agree to our
        <Text style={styles.link}> terms and conditions </Text>
        and <Text style={styles.link}>privacy policy</Text>
      </Text>
    </LinearGradient>
  );
}

