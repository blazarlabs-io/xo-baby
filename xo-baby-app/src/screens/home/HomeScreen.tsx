import React, { useEffect } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { styles } from './styles/HomeScreen.styles';
import api from '../../api/axios'
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {  AppStackParamList } from '../../types/navigation'; 
import { useUserStore } from '../../store/userStore';
import { useKidStore } from '../../store/kidStore';
import NoKidsPlaceholder from './NoKidsPlaceholder'
import KidSlider from '../../components/Kid/KidSlider';
import { getMyKids } from '../../api/kidApi';
import type { HomeStackParamList } from '@/navigation/HomeStack';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'HomeScreen'>>();

  const route = useRoute<RouteProp<HomeStackParamList, 'Home'>>();
  const focusKidId = route.params?.focusKidId;


  const kids = useKidStore((state) => state.kids);
	const setKids = useKidStore.getState().addKid;
  const user = useUserStore((state) => state.user);

	useEffect(() => {
  const fetchKids = async () => {
    if (!user?.token) return;
    try {
      const kids = await getMyKids(user.token);
      useKidStore.getState().addKids(kids);
    } catch (error) {
      console.error('Failed to fetch kids:', error);
    }
  };

  fetchKids();
}, [user]);
 

  console.log('Kids:', kids);
  console.log('User:', user);

    return (
    <View style={styles.container}>
        {kids.length === 0 ? (
				<>
					<NoKidsPlaceholder onAdd={() => navigation.navigate('AddKidName')} />
					<Pressable onPress={() => navigation.navigate('AddKidName')} style={styles.addNewKidButton}>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
							<Image source={require('../../../assets/home-parent/baby.png')} style={{ width: 24, height: 24 }} />
							<Text style={styles.addKidText}>Add first Kid</Text>
						</View>
					</Pressable>
				</>
        ) : (
        <>
            <KidSlider kids={kids} initialKidId={focusKidId} />
            
        </>
        )}
    </View>
    );

}
