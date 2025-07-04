import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
// Styles
import { styles } from './styles/DevicesScreen.styles'
// Navigation
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';

interface DeviceItemScreenProps {
  kidId: string;
}

const DeviceItemScreen = ({ kidId } : DeviceItemScreenProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'DeviceItem'>>();

  // is connected device
  const isConnected = true;
  const isOnline = true

  return (
    <View style={styles.container}>
      <View style={styles.componentHeaderContainer}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Image source={require('../../../assets/common/chevron-left.png')} width={24} height={24} />
        </Pressable>
        <View style={{display: 'flex', flexDirection: 'row', gap: 4}}>
          <Image
            source={require('../../../assets/home-parent/tabs/device-active.png')}
            style={{ width: 18, height: 24 }} />
          <Text style={styles.realTimeText}>xo-AxS83Eg1</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.itemHeaderCont}>
          <View style={styles.statusBadge}>
            <View style={[styles.circle,  { backgroundColor: isOnline ? '#92F939' : '#FF6D68' } ] }></View>
            <Text style={styles.statusText}>{ isOnline ? 'Online' : 'Offline' }</Text>
          </View>
          <Text style={styles.itemHeaderTitle}>XO-BABY</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
              source={require('../../../assets/home-parent/devices/device1.png')}
              style={{ width: 200, height: 307 }} />
        </View>
        

        <Pressable onPress={() => navigation.navigate('Devices', { kidId: kidId })} >
          <View style={styles.itemBtnDisconnect}>
            <Text style={styles.itemBtnText}>Disconnect</Text>
          </View>
        </Pressable>
      </ScrollView>
      
    </View>
  );
};



export default DeviceItemScreen;

