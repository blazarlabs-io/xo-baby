import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Keyboard, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../types/navigation';
import { Platform } from 'react-native';
import { useUserStore } from '../../../store/userStore';
import { signInWithGoogle } from '../../../services/googleSignIn';


export default function LoginEmailScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'LoginEmail'>>();
  const { setUser } = useUserStore();

  const handleNext = () => {
    if (email.trim()) {
      Keyboard.dismiss();
      navigation.navigate('LoginPassword', { email });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('🔍 Starting Google Login...');

      const result = await signInWithGoogle();
      const { user: firebaseUser, userInfo } = result;

      console.log('🔍 Google Login successful:', {
        firebaseUser: firebaseUser.uid,
        email: firebaseUser.email,
        userInfo,
      });

      // Get the Firebase token
      const token = await firebaseUser.getIdToken();

      // Verify user exists in backend
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/users/verify-token`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const userProfile = await response.json();
          console.log('🔍 Google Login - User profile loaded:', userProfile);

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            token: token,
            role: userProfile.role || 'parent',
          });

          Alert.alert(
            'Login Successful!',
            `Welcome back, ${userProfile.firstName || 'User'}!`,
            [{ text: 'OK' }]
          );
        } else {
          // User doesn't exist - redirect to sign-up
          console.log('🔍 Google Login - User not found, please sign up first');

          Alert.alert(
            'Account Not Found',
            'No account found with this Google email. Please sign up first.',
            [{ text: 'OK' }]
          );
        }
      } catch (profileError) {
        console.warn('Failed to verify user profile:', profileError);

        // Fallback: set user with default role
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          token: token,
          role: 'parent',
        });

        Alert.alert(
          'Login Successful!',
          'Logged in with Google.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Google Login error:', error);
      Alert.alert(
        'Google Login Failed',
        error.message ||
          'An error occurred during Google Login. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (

    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <View style={{ height: 24, flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <View style={styles.backBtn}><Text>Back</Text></View>
        <View style={styles.headerText}><Text>Login</Text></View>
      </View>
      <View style={{marginTop: 24, justifyContent: 'center', alignItems: 'center'}}>
        <View style={{ gap: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.progressPointActive} ></View>
          <View style={styles.progressPoint}></View>
        </View>
      </View>
      <View style={{ marginTop: 24, maxWidth: 172 }}>
        <Text style={styles.title}>Enter your email</Text>
      </View>
      <TextInput
        style={[
          styles.input,
          Platform.select({
            android: { paddingVertical: 8, textAlignVertical: 'center' }, // avoid clipping
          }),
        ]}
        placeholder="my@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={handleNext}
        returnKeyType="done"
      />

      {/* Google Login Button */}
      <View style={styles.googleLoginContainer}>
        <Pressable style={styles.socialButton} onPress={handleGoogleLogin}>
          <View style={styles.socialButtonContent}>
            <Image
              source={require('../../../../assets/common/google-icon.png')}
              style={styles.socialIcon}
              resizeMode="cover"
            />
            <Text style={styles.socialText}>Login With Google</Text>
          </View>
        </Pressable>
      </View>

      <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' }}>
        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    </LinearGradient>


  );
}

const styles = StyleSheet.create({
  backBtn: { borderWidth: 1, borderColor: '#CACACA', width: 54,  height: 24, borderRadius: 4, cursor: 'pointer', position: 'absolute', left: 0,  alignItems: 'center' },
  container: { flex: 1,  padding: 24, backgroundColor: 'white',  },
  headerText: { fontSize: 16, fontWeight: 'bold', justifyContent: 'center', textAlign: 'center' },
  progressPointActive: { width: 12, height: 12, borderRadius: 50, backgroundColor: '#31CECE' },
  progressPoint: { width: 12, height: 12, borderRadius: 50, backgroundColor: '#CACACA' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 42, letterSpacing: 1.5, color: '#222128'},
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 0,
    borderRadius: 10,
    marginTop: 16,
    fontSize: 18,
    color: '#CACACA',
  },
  googleLoginContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  socialButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#DCE3E3',
    marginVertical: 5,
    width: '90%',
    maxWidth: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'white',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  socialIcon: {
    width: 15,
    height: 15,
    position: 'absolute',
    left: 5,
  },
  socialText: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#31CECE',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    maxWidth: 320,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  backText: { textAlign: 'center', marginTop: 10, color: '#999' },
});