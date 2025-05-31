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
            <TouchableOpacity onPress={() => navigation.navigate('AddKidName')}>
                <Text >+ Add Kid</Text>
            </TouchableOpacity>
        </>
        )}
    </View>
    );

}

