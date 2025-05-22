import React, { useState, useEffect } from 'react';
import { View, Text,Image, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../types/navigation';

export default function SignupCheckEmailScreen() {
  const [password, setPassword] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const insets = useSafeAreaInsets();


  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'SignupCheckEmailScreen'>>();

  useEffect(() => {
    if (seconds === 0) return;

    const timer = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const handleNext = () => {
    setEmailConfirmed(true);
    navigation.navigate('SignupEmailConfirmedScreen');
  };

  const handleBack = () => {
    setEmailConfirmed(false);
    setSeconds(30); 
  };

  const handleResendEmail = () => {
    setSeconds(30);
  };

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <SafeAreaView style={styles.safeAreaContent}>
      <View style={{ height: 24, flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <View style={styles.headerText}><Text>Verify Account</Text></View>
      </View>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../../../../assets/signup/email1.png')} style={{ width: 314, height: 219 }} />
      </View>
      <View style={{ marginTop: 24, }}>
        <Text style={styles.title}>Check your email inbox</Text>
        <Text style={styles.text1}>We’ve sent you an email. Please check your inbox and follow instructions to verify your account.</Text>
        <View>
          <Text style={styles.text2}>Didn’t receive an email?</Text>
        </View>
        <View style={{ marginTop: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Text 
            onPress={handleResendEmail} 
            disabled={seconds > 0} 
            style={styles.text3}>Resend Email</Text>
          <Text style={styles.text4}>in { seconds } seconds</Text>
        </View>
      </View>
      

      <View style={{ position: 'absolute', bottom: insets.bottom + 16, width: '100%', alignSelf: 'center' }}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backBtn: { borderWidth: 1, borderColor: '#CACACA', width: 54,  height: 24, borderRadius: 4, cursor: 'pointer', position: 'absolute', left: 0,  alignItems: 'center' },
  container: { flex: 1 },
  safeAreaContent: { flex: 1, padding: 24, },
  headerText: { fontSize: 16, fontWeight: 'bold', justifyContent: 'center', textAlign: 'center' },
  progressPointActive: { width: 12, height: 12, borderRadius: 50, backgroundColor: '#31CECE' },
  progressPoint: { width: 12, height: 12, borderRadius: 50, backgroundColor: '#CACACA' },
  title: { fontSize: 24, fontWeight: 'bold', lineHeight: 42, letterSpacing: 1.5, color: '#222128', alignSelf: 'center', marginTop: 24, textAlign: 'center'},
  text1: { fontSize: 16, lineHeight: 20, letterSpacing: 1.5, color: '#8D8D8D', marginTop: 24, textAlign: 'center'},
  text2: { fontSize: 16, lineHeight: 20, letterSpacing: 1.5, color: '#222128', marginTop: 24, textAlign: 'center'},
  text3: { fontSize: 16, lineHeight: 20, letterSpacing: 1.5, color: '#31CECE', marginTop: 24, textAlign: 'center', textDecorationLine: 'underline', cursor: 'pointer', fontWeight: 'bold'},
  text4: { fontSize: 16, lineHeight: 20, letterSpacing: 1.5, color: '#31CECE', marginTop: 24, textAlign: 'center', fontWeight: 'bold'},
  input: {
    height: 36,
    borderWidth: 0,
    borderRadius: 10,
    marginTop: 16,
    fontSize: 24,
    color: '#CACACA',
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
