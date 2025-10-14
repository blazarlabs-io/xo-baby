import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { useCustomFonts } from './src/hooks/useCustomFonts'
import { attachAuthTokenListener } from './src/auth/attachAuthTokenListener';

export default function App() {

  const fontsLoaded = useCustomFonts()

  useEffect(() => {
    // Attach Firebase auth listener
    const unsubscribe = attachAuthTokenListener();
    return () => unsubscribe(); // cleanup on unmount / fast refresh
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
