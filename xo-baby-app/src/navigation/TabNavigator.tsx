import React from "react";

// Navigator
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CustomTabBar from "./CustomTabBar";

// import your screens:
import HomeStack from "./HomeStack"; // Home Stack screens
import DevicesStack from "./DevicesStack"; // Devices Stack screens
import SettingsScreen from "@/screens/home/SettingsScreen";
import MedicalDashboard from "@/screens/home/MedicalDashboard";
import AdminDashboard from "@/screens/home/AdminDashboard";
import PersonnelScreen from "@/screens/home/PersonnelScreen";
import KidsListScreen from "@/screens/home/KidsListScreen";

// store
import { useUserStore } from "@/store/userStore";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const user = useUserStore((s) => s.user);
  const role = user?.role || "parent";
  
  // Debug logging
  console.log("🔍 TabNavigator - User:", user);
  console.log("🔍 TabNavigator - Role:", role);

  return (
    <Tab.Navigator
      key={`tab-${role}`} // Force re-render when role changes
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {role === "parent" && (
        <>
          <Tab.Screen name="MyKids" component={HomeStack} />
          <Tab.Screen name="Devices" component={DevicesStack} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </>
      )}

      {role === "medical" && (
        <>
          <Tab.Screen 
            name="MyKids" 
            component={HomeStack}
            options={{ title: "Patients" }}
          />
          <Tab.Screen name="Devices" component={DevicesStack} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </>
      )}

      {role === "admin" && (
        <>
          <Tab.Screen 
            name="MyFacility" 
            component={AdminDashboard}
            options={{ title: "My Facility" }}
          />
          <Tab.Screen 
            name="Kids" 
            component={KidsListScreen}
            options={{ title: "Kids" }}
          />
          <Tab.Screen 
            name="Personnel" 
            component={PersonnelScreen}
            options={{ title: "Personnel" }}
          />
          <Tab.Screen name="Devices" component={DevicesStack} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
    </Tab.Navigator>
  );
}
