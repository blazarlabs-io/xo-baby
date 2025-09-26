import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import HomeScreen from "@/screens/home/HomeScreen";
import MedicalDashboard from "@/screens/home/MedicalDashboard";
import RealTimeDataScreen from "@/screens/kids/RealTimeDataScreen";
import DevelopmentScreen from "@/screens/kids/DevelopmentScreen";
import TasksScreen from "@/screens/kids/TasksScreen";
import NotesScreen from "@/screens/kids/NotesScreen";
import { useUserStore } from "@/store/userStore";

export type HomeStackParamList = {
  Home: { focusKidId?: string } | undefined;
  MedicalDashboard: undefined;
  RealTimeData: { kidId: string };
  Development: { kidId: string };
  Tasks: { kidId: string };
  Notes: { kidId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  const user = useUserStore((s) => s.user);
  const role = user?.role || "parent";
  
  // Debug logging
  console.log("🔍 HomeStack - User:", user);
  console.log("🔍 HomeStack - Role:", role);
  
  // Determine initial screen based on user role
  const initialRouteName = role === "medical" ? "MedicalDashboard" : "Home";
  
  console.log("🔍 HomeStack - Initial Route:", initialRouteName);

  return (
    <Stack.Navigator 
      key={`home-${role}`} // Force re-render when role changes
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="MedicalDashboard" component={MedicalDashboard} />
      <Stack.Screen name="RealTimeData" component={RealTimeDataScreen} />
      <Stack.Screen name="Development" component={DevelopmentScreen} />
      <Stack.Screen name="Tasks" component={TasksScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
    </Stack.Navigator>
  );
}
