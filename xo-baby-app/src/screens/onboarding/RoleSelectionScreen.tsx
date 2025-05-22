import React from 'react';
import { View, Text, Image,  StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ROLE_LABELS, UserRole } from '../../constants/roles';
import { AuthStackParamList } from '../../types/navigation';



type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'RoleSelection'>;

const RoleSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleSelectRole = (role: UserRole) => {
    navigation.navigate('Welcome');
  };

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../../../assets/roleSelection/Logo.png')} style={{ width: 110, height: 114 }} />
      </View>
      <Text style={styles.title}>Who are you?</Text>
      {Object.entries(ROLE_LABELS).map(([key, label]) => (
        <TouchableOpacity
          key={key}
          style={styles.roleButton}
          onPress={() => handleSelectRole(key as UserRole)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 32,
                backgroundColor: 'gray',
                marginRight: 8,
              }}
            />
            <Text style={styles.roleText}>{label}</Text>
          </View>
          
        </TouchableOpacity>
      ))}
    </LinearGradient>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center',  },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 30, textAlign: 'center', marginTop: 90 },
  roleButton: {
    backgroundColor: '#F6FFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginVertical: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAF5F5',
    height: 72,
  },
  roleText: {
    fontSize: 18,
    color: '#222128',
    textAlign: 'center',
  },
});
