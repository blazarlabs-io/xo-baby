import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/onboarding/HomeScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* add more screens here later */}
    </Stack.Navigator>
  );
}
