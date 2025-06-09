import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../types/navigation'; 


export default function LoginEmailScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'LoginEmail'>>();

  const handleNext = () => {
    if (email.trim()) {
      Keyboard.dismiss();
      navigation.navigate('LoginPassword', { email });
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
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
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