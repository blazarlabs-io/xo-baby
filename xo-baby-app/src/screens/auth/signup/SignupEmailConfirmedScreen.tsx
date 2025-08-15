import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../types/navigation';

export default function SignupEmailConfirmedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'SignupEmailConfirmedScreen'>>();

  const handleNext = () => {
    Alert.alert(
      'Welcome to XO-Baby!',
      'Your account has been successfully created and verified. You can now access all features of the app.',
      [
        {
          text: 'Get Started',
          onPress: () => {
            // Navigate to main app
            console.log('Navigating to main app...');
            // navigation.navigate('HomeScreen' as any);
          }
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <View style={{ height: 24, flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <View style={styles.headerText}><Text>Verify Account</Text></View>
      </View>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../../../../assets/signup/email2.png')} style={{ width: 251, height: 218 }} />
      </View>
      <View style={styles.textContainer}>
        <View style={{ marginTop: 24, maxWidth: 172 }}>
          <Text style={styles.title}>Email confirmed</Text>
        </View>
      </View>

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
  backBtn: { borderWidth: 1, borderColor: '#CACACA', width: 54, height: 24, borderRadius: 4, cursor: 'pointer', position: 'absolute', left: 0, alignItems: 'center' },
  container: { flex: 1, padding: 24, },
  headerText: { fontSize: 16, fontWeight: 'bold', justifyContent: 'center', textAlign: 'center' },
  textContainer: { alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 42, letterSpacing: 1.5, color: '#222128' },
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
