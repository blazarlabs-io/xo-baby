// src/hooks/useCustomFonts.ts
import { useFonts } from 'expo-font';

export const useCustomFonts = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Roboto-Medium': require('../../assets/fonts/Roboto-Medium.ttf'),
  });

  return fontsLoaded;
};
