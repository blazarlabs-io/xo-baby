import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import AddKidNameScreen from '../screens/kids/AddKid/AddKidNameScreen'
import AddKidLastNameScreen from '../screens/kids/AddKid/AddKidLastNameScreen';
import AddKidGenderScreen from '../screens/kids/AddKid/AddKidGenderScreen';
import AddKidBirthdayScreen from '../screens/kids/AddKid/AddKidBirthdayScreen';
import AddKidBloodTypeScreen from '../screens/kids/AddKid/AddKidBloodType';
import AddKidEthnicityScreen from '../screens/kids/AddKid/AddKidEthnicityScreen';
import AddKidLocationScreen from '../screens/kids/AddKid/AddKidLocationScreen';
import AddKidAnomaliesScreen from '../screens/kids/AddKid/AddKidAnomaliesScreen';
import AddKidAvatarScreen from '../screens/kids/AddKid/AddKidAvatarScreen';
import KidProfileScreen from '../screens/kids/KidProfileScreen';
import RealTimeDataScreen from '../screens/kids/RealTimeDataScreen';
import DevelopmentScreen from '../screens/kids/DevelopmentScreen';
import TasksScreen from '../screens/kids/TasksScreen';
import NotesScreen from '../screens/kids/NotesScreen';
import ProtectedRoute from '../components/ProtectedRoute';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tab-based root navigator */}
      <Stack.Screen
        name="Tabs"
        component={(props: any) => (
          <ProtectedRoute>
            <TabNavigator {...props} />
          </ProtectedRoute>
        )}
      />

      {/* Add-Kid flow screens - all protected */}
      <Stack.Screen
        name="AddKid"
        component={(props: any) => (
          <ProtectedRoute>
            <AddKidNameScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidName"
        component={(props: any) => (
          <ProtectedRoute>
            <AddKidNameScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidLastName"
        component={(props: any) => (
          <ProtectedRoute>
            <AddKidLastNameScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidGender"
        component={(props: any) => (
          <ProtectedRoute>
            <AddKidGenderScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidBirthday"
        component={(props: any) => (
          <ProtectedRoute>
            <AddKidBirthdayScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidBloodType"
        component={(props: any) => (
          <ProtectedRoute>
            <AddKidBloodTypeScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidEthnicity"
        component={(props: any) => (
          <ProtectedRoute>
            <AddKidEthnicityScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidLocation"
        component={(props: any) => (
          <ProtectedRoute>
            <AddKidLocationScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidAnomalies"
        component={(props: any) => (
          <ProtectedRoute>
            <AddKidAnomaliesScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidAvatar"
        component={(props: any) => (
          <ProtectedRoute>
            <AddKidAvatarScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="KidProfile"
        component={(props: any) => (
          <ProtectedRoute>
            <KidProfileScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="RealTimeData"
        component={(props: any) => (
          <ProtectedRoute>
            <RealTimeDataScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="Development"
        component={(props: any) => (
          <ProtectedRoute>
            <DevelopmentScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="Tasks"
        component={(props: any) => (
          <ProtectedRoute>
            <TasksScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="Notes"
        component={(props: any) => (
          <ProtectedRoute>
            <NotesScreen {...props} />
          </ProtectedRoute>
        )}
      />
    </Stack.Navigator>
  );
}
