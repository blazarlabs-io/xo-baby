import React, { useEffect } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { styles } from './WelcomeScreen.styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation'; 
import { useKidStore } from '../../store/kidStore';
import { useUserStore } from '../../store/userStore';
import type { UserRole } from '@/constants/roles';

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

//     useEffect(() => {
//       // Mock user data
//       const mockUser = {
//         uid: '1mjAa3McHnTK2R5malZ2cRFlO9O2',
//         email: 'vasea@mail.com',
//         token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjJiN2JhZmIyZjEwY2FlMmIxZjA3ZjM4MTZjNTQyMmJlY2NhNWMyMjMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veG8tYmFieSIsImF1ZCI6InhvLWJhYnkiLCJhdXRoX3RpbWUiOjE3NTUwODA1MDAsInVzZXJfaWQiOiIxbWpBYTNNY0huVEsyUjVtYWxaMmNSRmxPOU8yIiwic3ViIjoiMW1qQWEzTWNIblRLMlI1bWFsWjJjUkZsTzlPMiIsImlhdCI6MTc1NTA4MDUwMCwiZXhwIjoxNzU1MDg0MTAwLCJlbWFpbCI6InZhc2VhQG1haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInZhc2VhQG1haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.JApoh1ha1LroSk7bhgfbP_InW2d3T3yFOUrOoxReCaiL8YBCcGqFKrKcPUhHLG9VgjfVRQOGsnJ0_4Xl9T3urWoNmMb-cRG55RNwAARmD3hV5c6G6bBd2SkCMEHijj-aHLlUoR3sI3vJKLw7clc5J-hP993t7QG6WWu7tggr2LVIjqLMp_ufTefkaWsDj-UW_vM_ZDkeocWIKfH27SJ8Q2KUXw_1dtIWbTC0CVpayO_SYdQIsIMQyqc7vld1MVLrnEnsXiKXA8bpqHGzCwP94NuBWbnKQX16yYkrxi3w_4z2aepPlBOC4Ev6N2rKu4LZFgG1bg1vTiVOVFwTENuXyw',
//         role: 'parent' as UserRole
//       };
//
//       // Save mock user in store
//       setUser(mockUser);
//
//       // Mock kids data
//       const mockKids = [
//         {
//           id: 'BZnM9iTJRdt0xVL6Infv',
//           parentId: mockUser.uid,
//           firstName: 'Alice',
//           lastName: 'Johnson',
//           birthDate: '2021-05-10',
//           gender: 'female',
//           bloodType: 'A+',
//           ethnicity: 'Caucasian',
//           location: 'Chisinau',
//           congenitalAnomalies: [{ name: 'None', description: 'Healthy' }],
//           avatarUrl: '',
//           createdAt: new Date().toISOString(),
//           vitals: {
//             heartRate: 120,
//             oximetry: 98,
//             temperature: 36.6,
//             movement: 5,
//             feedingSchedule: 'every 3h'
//           }
//         },
//         {
//           id: 'fPKD2ANp3s7tfs4IyU9E',
//           parentId: mockUser.uid,
//           firstName: 'Leo',
//           lastName: 'Johnson',
//           birthDate: '2019-11-02',
//           gender: 'male',
//           bloodType: 'O-',
//           ethnicity: 'Caucasian',
//           location: 'Chisinau',
//           congenitalAnomalies: [{ name: 'Asthma', description: 'Mild condition' }],
//           avatarUrl: '',
//           createdAt: new Date().toISOString(),
//           vitals: {
//             heartRate: 110,
//             oximetry: 97,
//             temperature: 36.8,
//             movement: 6,
//             feedingSchedule: 'every 4h'
//           }
//         }
//       ];
//
//       useKidStore.getState().addKids(mockKids);
//     }, []);


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

