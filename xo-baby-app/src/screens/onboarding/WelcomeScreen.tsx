import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from './WelcomeScreen.styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation'; 
import { useKidStore } from '../../store/kidStore';
import { useUserStore } from '../../store/userStore';

import * as WebBrowser from 'expo-web-browser';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../config/firebase';


WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Welcome'>>();

    const kids = useKidStore((state) => state.kids);
    const setUser = useUserStore.getState().setUser;
    const user = useUserStore((state) => state.user);

    // ---------------------------------------------------------------------------

    useEffect(() => {
      // Mock user data
      const mockUser = {
        uid: 'mock-uid-1234',
        email: 'mockuser@example.com',
        token: 'mock-token-5678'
      };

      // Save mock user in store
      setUser(mockUser);

      // Mock kids data
      const mockKids = [
        {
          id: 'kid-1',
          parentId: mockUser.uid,
          firstName: 'Alice',
          lastName: 'Johnson',
          birthDate: '2021-05-10',
          gender: 'female',
          bloodType: 'A+',
          ethnicity: 'Caucasian',
          location: 'Chisinau',
          congenitalAnomalies: [{ name: 'None', description: 'Healthy' }],
          avatarUrl: '',
          createdAt: new Date().toISOString(),
          vitals: {
            heartRate: 120,
            oximetry: 98,
            temperature: 36.6,
            movement: 5,
            feedingSchedule: 'every 3h'
          }
        },
        {
          id: 'kid-2',
          parentId: mockUser.uid,
          firstName: 'Leo',
          lastName: 'Johnson',
          birthDate: '2019-11-02',
          gender: 'male',
          bloodType: 'O-',
          ethnicity: 'Caucasian',
          location: 'Chisinau',
          congenitalAnomalies: [{ name: 'Asthma', description: 'Mild condition' }],
          avatarUrl: '',
          createdAt: new Date().toISOString(),
          vitals: {
            heartRate: 110,
            oximetry: 97,
            temperature: 36.8,
            movement: 6,
            feedingSchedule: 'every 4h'
          }
        }
      ];

      useKidStore.getState().addKids(mockKids);
    }, []);


    //----------------------------------------------------------------------------

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

     <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
        <View style={styles.socialButtonContent}>
          <Image
            source={require('../../../assets/common/google-icon.png')}
            style={styles.socialIcon}
            resizeMode="cover"
          />
          <Text style={styles.socialText}>Sign In With Google</Text>
        </View>
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

