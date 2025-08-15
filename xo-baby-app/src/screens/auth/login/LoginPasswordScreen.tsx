import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Keyboard, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthStackParamList } from '../../../types/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserStore } from '../../../store/userStore';
import AuthService from '../../../services/authService';

export default function LoginPasswordScreen() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'LoginEmail'>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'LoginPassword'>>();
  const { email } = route.params;

  const setUser = useUserStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const user = await AuthService.signIn({ email, password });

      setUser(user);

      console.log('User logged in successfully:', user.email);

      // Navigate to main app
      // navigation.navigate('HomeScreen' as any);

      Alert.alert('Success', 'Login successful!', [
        {
          text: 'OK', onPress: () => {
            // Navigate to main app here
            console.log('Navigating to main app...');
          }
        }
      ]);
    } catch (error: any) {
      console.error('Login error:', error.message);
      Alert.alert('Login Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <View style={{ height: 24, flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
        <View style={styles.headerText}><Text>Login</Text></View>
      </View>
      <View style={{ marginTop: 24, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ gap: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.progressPointActive} ></View>
          <View style={styles.progressPointActive}></View>
        </View>
      </View>
      <View style={{ marginTop: 24, maxWidth: 172 }}>
        <Text style={styles.title}>Enter password</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="********"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={handleLogin}
        returnKeyType="done"
      />

      <View style={{ position: 'absolute', bottom: 24, width: '92%' }}>
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()} disabled={isLoading}>
          <Text style={[styles.backText, isLoading && styles.backTextDisabled]}>Back</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    borderWidth: 1,
    borderColor: '#CACACA',
    width: 54,
    height: 24,
    borderRadius: 4,
    cursor: 'pointer',
    position: 'absolute',
    left: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backBtnText: {
    fontSize: 12,
    color: '#666'
  },
  container: { flex: 1, padding: 24, backgroundColor: 'white', },
  headerText: { fontSize: 16, fontWeight: 'bold', justifyContent: 'center', textAlign: 'center' },
  progressPointActive: { width: 12, height: 12, borderRadius: 50, backgroundColor: '#31CECE' },
  progressPoint: { width: 12, height: 12, borderRadius: 50, backgroundColor: '#CACACA' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 42, letterSpacing: 1.5, color: '#222128' },
  input: {
    height: 36,
    borderRadius: 10,
    marginTop: 16,
    fontSize: 24,
    color: '#222128',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  button: {
    backgroundColor: '#31CECE',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  backText: { textAlign: 'center', marginTop: 10, color: '#999' },
  backTextDisabled: { color: '#CCCCCC' },
});
