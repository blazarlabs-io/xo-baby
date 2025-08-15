import React, { useEffect } from 'react';
import { View, Text, Image, Pressable, Alert } from 'react-native';
import { styles } from './WelcomeScreen.styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation';
import { useUserStore } from '../../store/userStore';
import type { UserRole } from '@/constants/roles';

import * as WebBrowser from 'expo-web-browser';
import AuthService from '../../services/authService';
import { auth } from '../../config/firebase';

WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Welcome'>>();
  const { user, setUser } = useUserStore();

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        // User is properly authenticated and verified
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          token: '', // Will be set when needed
          role: 'parent' as UserRole
        });

        // Navigate to main app only if email is verified
        // navigation.navigate('HomeScreen' as any);
      } else {
        // No user or email not verified - stay on welcome screen
        // Don't set user to null, just leave it as is
      }
    });

    return unsubscribe;
  }, [setUser, navigation]);

  const handleLogin = () => {
    navigation.navigate('LoginEmail');
  };

  const handleSignup = () => {
    navigation.navigate('SignupNameScreen');
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await AuthService.signInWithGoogle();

      setUser(user);

      // Navigate to main app
      // navigation.navigate('HomeScreen' as any);

      console.log('User logged in with Google:', user.email);
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook login
    Alert.alert('Coming Soon', 'Facebook login will be available soon.');
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

      <Pressable style={styles.socialButton} onPress={handleFacebookLogin}>
        <View style={styles.socialButtonContent}>
          <Image
            source={require('../../../assets/common/google-icon.png')}
            style={styles.socialIcon}
            resizeMode="cover"
          />
          <Text style={styles.socialText}>Sign In With Facebook</Text>
        </View>
      </Pressable>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }} >
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

