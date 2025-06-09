import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthStackParamList } from '../../../types/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../config/firebase';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserStore } from '../../../store/userStore';

export default function LoginPasswordScreen() {
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'LoginEmail'>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'LoginPassword'>>();
  const { email } = route.params;

  const setUser = useUserStore((state) => state.setUser);

  const handleLogin = async () => {
    if (email.trim()) {
      Keyboard.dismiss();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User logged in:', user.email);

        setUser({
          uid: user.uid,
          email: user.email ?? '',
          token: await user.getIdToken(),
        });

      } catch (error: any) {
        console.error('Login error:', error.message);
        alert(error.message);
      }
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
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
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
