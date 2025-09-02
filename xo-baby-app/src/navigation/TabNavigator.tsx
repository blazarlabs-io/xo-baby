import React from 'react';

// Navigator
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from './CustomTabBar';

// import your screens:
import HomeStack from './HomeStack'; // Home Stack screens
import DevicesStack from './DevicesStack'; // Devices Stack screens
import SettingsScreen from '@/screens/home/SettingsScreen'

// Role-specific dashboards
import ParentDashboard from '@/screens/home/ParentDashboard';
import DoctorDashboard from '@/screens/home/DoctorDashboard';
import AdminDashboard from '@/screens/home/AdminDashboard';

// store
import { useUserStore } from '@/store/userStore';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const role = useUserStore(s => s.user?.role) || 'parent';
  const user = useUserStore(s => s.user);

  console.log('🔍 TabNavigator - Current user:', user);
  console.log('🔍 TabNavigator - Current role:', role);
  console.log(`🔍 TabNavigator - Role condition check: role=${role}, parent=${role === 'parent'}, medical=${role === 'medical'}, admin=${role === 'admin'}`);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {role === 'parent' && (
        <>
          <Tab.Screen name="MyKids" component={ParentDashboard} />
          <Tab.Screen name="Devices" component={DevicesStack} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </>
      )}

      {role === 'medical' && (
        <>
          <Tab.Screen name="MyKids" component={DoctorDashboard} />
          <Tab.Screen name="Devices" component={DevicesStack} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </>
      )}

      {role === 'admin' && (
        <>
          <Tab.Screen name="MyFacility" component={AdminDashboard} />
          <Tab.Screen name="Kids" component={DoctorDashboard} />
          <Tab.Screen name="Personnel" component={DevicesStack} />
          <Tab.Screen name="Devices" component={DevicesStack} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </>
      )}

    </Tab.Navigator>
  );
}
