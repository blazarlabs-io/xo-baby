import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, Animated } from 'react-native';
// Styles
import { styles } from './styles/DevicesScreen.styles'
// Navigation
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';

const DeviceAddScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'DeviceAdd'>>();

  // control searching state: false at mount, turns true after 3 seconds
  const [isSearching, setIsSearching] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsSearching(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Base and max sizes to ensure animation stays within 240x240
  const BASE_CIRCLE_SIZE = 80;
  const MAX_CIRCLE_SIZE = BASE_CIRCLE_SIZE * 3; // 240px

  // Animated values for three circles
  const circleAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const loops: Animated.CompositeAnimation[] = [];
    if (isSearching) {
      circleAnims.forEach((anim, idx) => {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.delay(idx * 500),
            Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
          ])
        );
        loops.push(loop);
      });
      Animated.stagger(250, loops).start();
    } else {
      loops.forEach(loop => loop.stop());
      circleAnims.forEach(anim => anim.setValue(0));
    }
  }, [isSearching]);

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
          <Text style={styles.realTimeText}>Add New Device</Text>
        </View>
      </View>
      
      <View style={styles.bluetoothCont}>
        <View style={styles.animationWrapper}>
          {isSearching ? (
            circleAnims.map((anim, i) => {
              const scale = anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, MAX_CIRCLE_SIZE / BASE_CIRCLE_SIZE],
              });
              const opacity = anim.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0.5, 0, 0],
              });
              return (
                <Animated.View
                  key={i}
                  style={[styles.circleAnimated, { transform: [{ scale }], opacity }]}
                />
              );
            })
          ) : (
            <>
              <View style={[styles.circleStatic, styles.circleOuter]} />
              <View style={[styles.circleStatic, styles.circleMiddle]} />
              <View style={[styles.circleStatic, styles.circleInner]} />
            </>
          )}
          <View style={styles.centralIconWrapper}>
            <Image
              source={require('../../../assets/home-parent/devices/bluetooth.png')}
              style={styles.centralIcon}
            />
          </View>
        </View>
        <Text style={styles.blText}>Scanning for devices...</Text>
      </View>

      <ScrollView contentContainerStyle={styles.newblcontainer} showsVerticalScrollIndicator={false}>
        <View style={styles.newDeviceItem}>
          <Text style={styles.newDeviceItemText}>XO-prime-zXe74Rg-54826</Text>
          <Text style={styles.newDeviceItemTextStatus}>Not Connected</Text>
        </View>
        <View style={styles.newDeviceItem}>
          <Text style={styles.newDeviceItemText}>XO-New-zXe42Rg-13922</Text>
          <Text style={styles.newDeviceItemTextStatus}>Not Connected</Text>
        </View>
        <View style={styles.newDeviceItem}>
          <Text style={styles.newDeviceItemText}>XO-Ultra-zIs22Rg-24861</Text>
          <Text style={styles.newDeviceItemTextStatus}>Not Connected</Text>
        </View>
      </ScrollView>

    </View>
  );
};



export default DeviceAddScreen;

