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

// store
import { useUserStore } from "@/store/userStore";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const role = useUserStore((s) => s.user?.role) || "parent";

  return (
    <Tab.Navigator
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
            name="MyKids" 
            component={AdminDashboard}
            options={{ title: "Dashboard" }}
          />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
    </Tab.Navigator>
  );
}
