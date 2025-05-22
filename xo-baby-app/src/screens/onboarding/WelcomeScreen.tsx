import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from './WelcomeScreen.styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation'; 

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { auth } from '../../config/firebase';

import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { discovery } from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Welcome'>>();

    const handleLogin = () => {
        navigation.navigate('LoginEmail');
    };

    const handleSignup = () => {
        navigation.navigate('SignupNameScreen');  
    }

    const handleGoogleLogin = async () => {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          prompt: 'select_account',
          login_hint: ''
        });
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log(' User logged in with Google:', user);

      } catch (error) {
        console.error(' Google Sign-In error:', error);
      }
    };
    

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../../../assets/welcome/mama.png')} style={{ width: 251, height: 254 }} />
      </View>
      <Text style={styles.title}>Get Started</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.forgot}>Forgot your password?</Text>

      <Text style={styles.or}>Or</Text>

      <TouchableOpacity style={styles.socialButton} onPress={() => handleGoogleLogin()}>
        <Text style={styles.socialText}>Sign In With Google</Text>
      </TouchableOpacity>


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

