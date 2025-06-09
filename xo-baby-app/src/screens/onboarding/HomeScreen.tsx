import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from './WelcomeScreen.styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../types/navigation'; 
import { useUserStore } from '../../store/userStore';
export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'HomeScreen'>>();

    const clearUser = useUserStore((state) => state.clearUser);
    const user = useUserStore((state) => state.user);

    const handleLogout = () => {
      clearUser();                  
      navigation.replace('Welcome');
    };  

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../../../assets/welcome/mama.png')} style={{ width: 251, height: 254 }} />
      </View>
      <Text style={styles.title}>Home screen</Text>
      {user && (
        <>
          <Text style={{ textAlign: 'center', marginTop: 12 }}>
            Logged in as: {user.email}
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 12, color: '#555' }}>
            UID: {user.uid}
          </Text>
        </>
      )}
    

      <TouchableOpacity onPress={handleLogout}>
        <Text style={{color: 'red', textAlign: 'center', marginTop: 24}}>Logout</Text>
      </TouchableOpacity>
    
     
    </LinearGradient>
  );
}

