import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { useCustomFonts } from './src/hooks/useCustomFonts'

export default function App() {
  //fonts
  const fontsLoaded = useCustomFonts()
  if (!fontsLoaded) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
