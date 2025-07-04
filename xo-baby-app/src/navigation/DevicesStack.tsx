import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import DevicesScreen from '@/screens/home/DevicesScreen';
import DeviceItemScreen from '@/screens/home/DeviceItemScreen';
import DeviceAddScreen from '@/screens/home/DeviceAdd';

export type DevicesStackParamList = {
  Devices: { kidId: string }
  DeviceItem: { kidId: string }
  DeviceAdd: undefined
};

const Stack = createNativeStackNavigator<DevicesStackParamList>();

export default function DevicesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Devices" component={DevicesScreen} />
      <Stack.Screen name="DeviceItem" component={DeviceItemScreen} />
      <Stack.Screen name="DeviceAdd" component={DeviceAddScreen} />
    </Stack.Navigator>
  );
}
