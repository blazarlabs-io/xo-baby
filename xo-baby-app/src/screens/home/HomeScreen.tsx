import React, { useEffect } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { styles } from './styles/HomeScreen.styles';
import api from '../../api/axios'
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../types/navigation';
import { useUserStore } from '../../store/userStore';
import { useKidStore } from '../../store/kidStore';
import NoKidsPlaceholder from './NoKidsPlaceholder'
import KidSlider from '../../components/Kid/KidSlider';
import { getMyKids } from '../../api/kidApi';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'HomeScreen'>>();

  const kids = useKidStore((state) => state.kids);
  const setKids = useKidStore.getState().addKid;
  const user = useUserStore((state) => state.user);

  // mock kid
  //   useEffect(() => {
  //   if (kids.length === 0) {
  //     useKidStore.getState().addKid({
  //       id: '1',
  //       parentId: user?.uid || 'parent-1',
  //       name: 'Test Kid',
  //       birthDate: '2020-01-01',
  //       vitals: {
  //         heartRate: 90,
  //         oximetry: 98,
  //       },
  //     });
  //     }
  //   }, []);

  useEffect(() => {
    const fetchKids = async () => {
      try {
        const kids = await getMyKids(user?.uid || '');
        console.log('Received kids from API:', kids);
        useKidStore.getState().addKids(kids);
      } catch (error) {
        console.log('Failed to fetch kids:');
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
          <KidSlider kids={kids} />

        </>
      )}
    </View>
  );

}
