import React from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet, Text, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { safeArea } from '../constants/safeArea';
import { useUserStore } from '../store/userStore';

const { width } = Dimensions.get('window');
const TAB_HEIGHT = 93;

// map each route key to its inactive/active image assets
const ICON_MAP: Record<string, { inactive: any; active: any }> = {
  MyKids: {
    inactive: require('../../assets/home-parent/tabs/kid.png'),
    active: require('../../assets/home-parent/tabs/kid-active.png'),
  },
  MyFacility: {
    inactive: require('../../assets/home-parent/tabs/kid.png'),
    active: require('../../assets/home-parent/tabs/kid-active.png'),
  },
  Kids: {
    inactive: require('../../assets/home-parent/tabs/kid.png'),
    active: require('../../assets/home-parent/tabs/kid-active.png'),
  },
  Personnel: {
    inactive: require('../../assets/home-parent/tabs/device.png'),
    active: require('../../assets/home-parent/tabs/device-active.png'),
  },
  Devices: {
    inactive: require('../../assets/home-parent/tabs/device.png'),
    active: require('../../assets/home-parent/tabs/device-active.png'),
  },
  Settings: {
    inactive: require('../../assets/home-parent/tabs/settings.png'),
    active: require('../../assets/home-parent/tabs/settings-active.png'),
  },
};

// Path for rectangle 
const createPath = () => {
  const tl = 24; // border radius 
  const tr = 32; // border radius
  const h = TAB_HEIGHT;
  const w = width;

  return `
    M0,${tl}
    A${tl},${tl} 0 0 1 ${tl},0
    L${w - tr},0
    A${tr},${tr} 0 0 1 ${w},${tr}
    L${w},${h}
    L0,${h}
    Z
  `;
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const role = useUserStore(s => s.user?.role) || 'parent';

  // Role-specific label mapping
  const getLabel = (routeName: string) => {
    if (role === 'admin') {
      const adminLabels: Record<string, string> = {
        MyFacility: 'My Facility',
        Kids: 'Kids',
        Personnel: 'Personnel',
        Devices: 'Devices',
        Settings: 'Settings',
      };
      return adminLabels[routeName] || routeName;
    } else {
      const defaultLabels: Record<string, string> = {
        MyKids: 'My Kids',
        Devices: 'My Devices',
        Settings: 'Settings',
      };
      return defaultLabels[routeName] || routeName;
    }
  };

  return (
    <View style={[styles.container, { bottom: safeArea.bottom }]}>
      <Svg width={width} height={TAB_HEIGHT} style={styles.svg}>
        <Path
          d={createPath()}
          fill="#FFFFFF"
          stroke="#dce3e3"
          strokeWidth={1}
        />
      </Svg>

      <View style={styles.buttons}>
        {state.routes.map((route, idx) => {
          const focused = state.index === idx;
          const { inactive, active } = ICON_MAP[route.name] || {};
          const source = focused ? active : inactive;

          // determine label text based on role
          const label = getLabel(route.name);

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.7}
              style={styles.button}
            >
              <View style={styles.inner}>
                <Image source={source} style={styles.icon} />
                <Text style={[styles.label, { color: focused ? '#31cece' : '#8d8d8d' }]}>{label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: TAB_HEIGHT,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android shadow
    elevation: 5,
  },
  svg: {
    position: 'absolute',
    top: 0,

  },
  buttons: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  button: {
    flex: 1,
  },
  inner: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    textAlign: 'center'
  },
});
