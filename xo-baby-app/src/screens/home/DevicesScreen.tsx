import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../types/navigation';
import {styles} from './styles/DevicesScreen.styles';

const DEVICE = { id: 'xo-AxS83Eg1', name: 'Mi Pulse Monitor S1 (A7:3C)' };

export default function DevicesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  // Setează "true" dacă vrei să pornească deja conectat
  const [isConnected, setIsConnected] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const isOnline = isConnected; // online/offline depinde de isConnected

  const onEdit = () => navigation.navigate('DeviceItem', { kidId: DEVICE.id });

  const onConnect = () => {
    if (isConnecting || isConnected) return;
    setIsConnecting(true);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      setIsConnecting(false);
      setIsConnected(true);
      progress.setValue(0);
    });
  };

  const onDisconnect = () => {
    if (isConnecting) return;
    setIsConnected(false);
  };

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.screenTitle}>My Devices</Text>

      {/* Un singur device în listă (mock) */}
      <View style={styles.connectContainer}>
        {/* Status badge */}
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.circle,
              { backgroundColor: isConnecting ? '#FEC84B' : isOnline ? '#92F939' : '#FF6D68' },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnecting ? 'Connecting…' : isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>

        {/* Device name + ID */}
        <View style={styles.contentContainer}>
          <Text style={styles.deviceTitle}>{DEVICE.name}</Text>
          <Text style={styles.deviceID}>{DEVICE.id}</Text>
        </View>

        {/* Buttons / Connecting animation */}
        <View style={styles.btnContainer}>
          {isConnected && !isConnecting && (
            <>
              <Pressable style={styles.disconectBtn} onPress={onDisconnect}>
                <Text style={styles.disconectBtnText}>Disconnect</Text>
              </Pressable>
              <Pressable style={styles.editBtn} onPress={onEdit}>
                <Text style={styles.editBtnText}>Edit</Text>
              </Pressable>
            </>
          )}

          {!isConnected && !isConnecting && (
            <Pressable style={styles.connectBtn} onPress={onConnect}>
              <Text style={styles.connectBtnText}>Connect</Text>
            </Pressable>
          )}

          {isConnecting && (
            <View style={styles.connectingWrap}>
              <View style={styles.connectingBar}>
                <Animated.View style={[styles.connectingFill, { width: widthInterpolate }]} />
              </View>
              <Text style={styles.connectingText}>Connecting to device…</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

