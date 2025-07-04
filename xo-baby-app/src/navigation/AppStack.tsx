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

import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tab-based root navigator */}
      <Stack.Screen name="Tabs" component={TabNavigator} />

      {/* Add-Kid flow screens */}
      <Stack.Screen name="AddKid" component={AddKidNameScreen} />
      <Stack.Screen name="AddKidName" component={AddKidNameScreen} />
      <Stack.Screen name="AddKidLastName" component={AddKidLastNameScreen} />
      <Stack.Screen name="AddKidGender" component={AddKidGenderScreen} />
      <Stack.Screen name="AddKidBirthday" component={AddKidBirthdayScreen} />
      <Stack.Screen name="AddKidBloodType" component={AddKidBloodTypeScreen} />
      <Stack.Screen name="AddKidEthnicity" component={AddKidEthnicityScreen} />
      <Stack.Screen name="AddKidLocation" component={AddKidLocationScreen} />
      <Stack.Screen name="AddKidAnomalies" component={AddKidAnomaliesScreen} />
      <Stack.Screen name="AddKidAvatar" component={AddKidAvatarScreen} />

    </Stack.Navigator>
  );
}
