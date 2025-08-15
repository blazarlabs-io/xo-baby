import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Keyboard, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../types/navigation';
import { validateEmail } from '../../../utils/authValidation';


export default function SignupEmailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'SignupEmailScreen'>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'SignupEmailScreen'>>();

  const [email, setEmail] = useState('');
  const { name } = route.params;

  const handleNext = () => {
    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    Keyboard.dismiss();
    navigation.navigate('SignupPasswordScreen', { name, email: email.trim() });
  };

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <View style={{ height: 24, flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
        <View style={styles.headerText}><Text>CREATE ACCOUNT</Text></View>
      </View>
      <View style={{ marginTop: 24, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ gap: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.progressPointActive} ></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPoint}></View>
          <View style={styles.progressPoint}></View>
        </View>
      </View>
      <View style={{ marginTop: 24, maxWidth: 172 }}>
        <Text style={styles.title}>Enter your email</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="my@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={handleNext}
        returnKeyType="done"
      />

      <View style={{ position: 'absolute', bottom: 24, width: '92%' }}>
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
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  backText: { textAlign: 'center', marginTop: 10, color: '#999' },
});