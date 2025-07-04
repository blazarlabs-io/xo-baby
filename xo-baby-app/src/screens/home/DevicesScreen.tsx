import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
// Styles
import { styles } from './styles/DevicesScreen.styles'
// Navigation
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';

interface DeviceScreensProps {
  kidId: string;
}

const DevicesScreen = ({ kidId } : DeviceScreensProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'Devices'>>();

  // is connected device
  const isConnected = true;
  const isOnline = true

  // on edit function
  const onEdit = () => {
    navigation.navigate('DeviceItem', { kidId: kidId });
  }
  // on add new device
  const onAdd = () => {
    navigation.navigate('DeviceAdd');
  }


  return (
    <View style={styles.container}>
      <View style={styles.componentHeaderContainer}>
        <Image
          source={require('../../../assets/home-parent/tabs/device-active.png')}
          style={{ width: 18, height: 24 }} />
        <Text style={styles.realTimeText}>My Devices</Text>
      </View>

      {
        isConnected ? (
          <View style={[styles.connectContainer]}>
            <View style={styles.statusBadge}>
              <View style={[styles.circle,  { backgroundColor: isOnline ? '#92F939' : '#FF6D68' } ] }></View>
              <Text style={styles.statusText}>{ isOnline ? 'Online' : 'Offline' }</Text>
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.deviceTitle}>XO-BABY</Text>
              <Text style={styles.deviceID}>xo-AxS83Eg1</Text>
            </View>
            <View style={styles.btnContainer}>
              <Pressable style={styles.disconectBtn}><Text style={styles.disconectBtnText}>Disconect</Text> </Pressable>
              <Pressable style={styles.editBtn} onPress={onEdit}><Text style={styles.editBtnText}>Edit</Text> </Pressable>
            </View>
          </View>
        ) : (
          // no device connected
          <View style={{width: '100%', display: 'flex', alignItems: 'center', marginTop: 20}}>
            <Text style={styles.contentTitle}>No one device conected</Text>
          </View>
        )
      }
      

      <Pressable onPress={onAdd} style={styles.buttonAdd}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={require('../../../assets/home-parent/baby.png')} style={{ width: 24, height: 24 }} />
          <Text style={styles.addKidText}>Add New Device</Text>
        </View>
      </Pressable>
      
    </View>
  );
};



export default DevicesScreen;

