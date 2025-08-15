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
import ProtectedRoute from '../components/ProtectedRoute';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tab-based root navigator */}
      <Stack.Screen
        name="Tabs"
        component={(props) => (
          <ProtectedRoute>
            <TabNavigator {...props} />
          </ProtectedRoute>
        )}
      />

      {/* Add-Kid flow screens - all protected */}
      <Stack.Screen
        name="AddKid"
        component={(props) => (
          <ProtectedRoute>
            <AddKidNameScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidName"
        component={(props) => (
          <ProtectedRoute>
            <AddKidNameScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidLastName"
        component={(props) => (
          <ProtectedRoute>
            <AddKidLastNameScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidGender"
        component={(props) => (
          <ProtectedRoute>
            <AddKidGenderScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidBirthday"
        component={(props) => (
          <ProtectedRoute>
            <AddKidBirthdayScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidBloodType"
        component={(props) => (
          <ProtectedRoute>
            <AddKidBloodTypeScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidEthnicity"
        component={(props) => (
          <ProtectedRoute>
            <AddKidEthnicityScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidLocation"
        component={(props) => (
          <ProtectedRoute>
            <AddKidLocationScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidAnomalies"
        component={(props) => (
          <ProtectedRoute>
            <AddKidAnomaliesScreen {...props} />
          </ProtectedRoute>
        )}
      />
      <Stack.Screen
        name="AddKidAvatar"
        component={(props) => (
          <ProtectedRoute>
            <AddKidAvatarScreen {...props} />
          </ProtectedRoute>
        )}
      />
    </Stack.Navigator>
  );
}
