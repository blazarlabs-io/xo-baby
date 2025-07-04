import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '@/screens/home/HomeScreen';
import RealTimeDataScreen from '@/screens/kids/RealTimeDataScreen';
import DevelopmentScreen from '@/screens/kids/DevelopmentScreen';
import TasksScreen from '@/screens/kids/TasksScreen';
import NotesScreen from '@/screens/kids/NotesScreen';

export type HomeStackParamList = {
  Home: undefined;
  RealTimeData: { kidId: string };
  Development: { kidId: string };
  Tasks: { kidId: string };
  Notes: { kidId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RealTimeData" component={RealTimeDataScreen} />
      <Stack.Screen name="Development" component={DevelopmentScreen} />
      <Stack.Screen name="Tasks" component={TasksScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
    </Stack.Navigator>
  );
}
