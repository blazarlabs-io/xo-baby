import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from './HomeScreen.styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {  AppStackParamList } from '../../types/navigation'; 
import { useUserStore } from '../../store/userStore';
import NoKidsPlaceholder from './NoKidsPlaceholder'
import KidSlider from '../../components/Kid/KidSlider';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'HomeScreen'>>();

  const user = useUserStore((state) => state.user);

  useEffect(() => {
  if (kids.length === 0) {
    useUserStore.getState().addKid({
      id: 'mock-kid-1',
      parentId: user?.uid || 'parent-1',
      name: 'Test Kid',
      birthDate: '2020-01-01',
      vitals: {
        heartRate: 90,
        oximetry: 98,
      },
    });
  }
}, []);
 

  const kids = useUserStore((state) => state.kids);

  console.log('Kids:', kids);
  console.log('User:', user);

    return (
    <View style={styles.container}>
        {kids.length === 0 ? (
        <NoKidsPlaceholder onAdd={() => navigation.navigate('AddKidName')} />
        ) : (
        <>
            <KidSlider kids={kids} />
            <TouchableOpacity onPress={() => navigation.navigate('AddKidName')} style={styles.addNewKidButton}>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
								<Image source={require('../../../assets/home-parent/baby.png')} style={{ width: 24, height: 24 }} />
								<Text style={styles.addKidText}>Add first Kid</Text>
							</View>
            </TouchableOpacity>
        </>
        )}
    </View>
    );

}
