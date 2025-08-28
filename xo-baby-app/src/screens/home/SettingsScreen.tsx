import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
// store
import { useUserStore } from '@/store/userStore';
import { useKidStore } from '@/store/kidStore';

import { logoutAll } from '@/services/logout';

interface SettingsScreensProps {
  kidId: string;
}

const SettingsScreen = ({ kidId} : SettingsScreensProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'Devices'>>();
  
  const user = useUserStore( s => s.user )

  const handleLogout = async () => {
      try {
        await logoutAll();
      } catch (e) {
        console.warn('Logout error', e);
        Alert.alert('Logout', 'Error, try again');
      }
    };

  return (
    <View style={styles.container}>
      <View style={styles.componentHeaderContainer}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Image source={require('../../../assets/common/chevron-left.png')} width={24} height={24} />
        </Pressable>
        <View style={{display: 'flex', flexDirection: 'row', gap: 4}}>
          <Image
            source={require('../../../assets/home-parent/tabs/settings-active.png')}
            style={{ width: 24, height: 24 }} />
          <Text style={styles.realTimeText}>Settings</Text>
        </View>
      </View>

      <View style={{width: '100%', display: 'flex', alignItems: 'center', marginTop: 20}}>
        <Text style={styles.contentTitle}>{user?.email}</Text>
      </View>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
      
    </View>
  );
};



export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 24,

  },
  componentHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 6.69
  },
  realTimeText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left"
  },
  buttonAdd: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 160,
    borderWidth: 1,
    borderColor: '#31CECE',
    borderRadius: 32, 
    borderStyle: 'dashed',
    width: '100%',
    height: 48,
    paddingHorizontal: 32,
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 8
  },
  addKidText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#31cece",
    textAlign: "left"
  },
  contentTitle: {
    width: "100%",
    flex: 1,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#222128",
    textAlign: "center"
  },
  backBtn: { 
    borderWidth: 1, 
    borderColor: '#CACACA', 
    width: 24,  
    height: 24, 
    borderRadius: 4, 
    cursor: 'pointer', 
    position: 'absolute', 
    left: 0,  
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  logoutBtn: {
    marginTop: 24, height: 48, borderRadius: 12,
    borderWidth: 1, borderColor: '#FF6B6B',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#FF6B6B' },
});
