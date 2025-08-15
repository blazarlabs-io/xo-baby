import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Keyboard, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../types/navigation';

import { useUserStore } from '../../../store/userStore';
import AuthService from '../../../services/authService';
import { validatePasswordConfirmation, formatName } from '../../../utils/authValidation';

export default function SignupConfirmPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'SignupConfirmPasswordScreen'>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'SignupConfirmPasswordScreen'>>();

  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { name, email, password } = route.params;
  const setUser = useUserStore((state) => state.setUser);

  const { firstName, lastName } = formatName(name);

  const handleConfirm = async () => {
    if (!validatePasswordConfirmation(password, passwordConfirm)) {
      Alert.alert('Error', 'Passwords do not match. Please try again.');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      // Create user using AuthService
      const user = await AuthService.signUp({
        firstName,
        lastName,
        email,
        password,
      });

      // Set user in store
      setUser(user);

      // Navigate to email verification screen
      navigation.navigate('SignupCheckEmailScreen');

    } catch (error: any) {
      console.error('User creation failed:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <View style={{ height: 24, flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <View style={styles.backBtn}><Text>Back</Text></View>
        <View style={styles.headerText}><Text>Create Account</Text></View>
      </View>
      <View style={{ marginTop: 24, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ gap: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.progressPointActive} ></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
        </View>
      </View>
      <View style={{ marginTop: 24, maxWidth: 172 }}>
        <Text style={styles.title}>Confirm password</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="********"
        secureTextEntry
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        onSubmitEditing={handleConfirm}
        returnKeyType="done"
      />

      <View style={{ position: 'absolute', bottom: 24, width: '92%' }}>
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
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
  backBtn: { borderWidth: 1, borderColor: '#CACACA', width: 54, height: 24, borderRadius: 4, cursor: 'pointer', position: 'absolute', left: 0, alignItems: 'center' },
  container: { flex: 1, padding: 24, },
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
