import React, { useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../types/navigation';
import { useUserStore } from '../../store/userStore';
import { useKidStore } from '../../store/kidStore';
import KidSlider from '../../components/Kid/KidSlider';
import { getMyKids } from '../../api/kidApi';

export default function ParentDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const kids = useKidStore((state) => state.kids);
  const user = useUserStore((state) => state.user);

  console.log('👶 ParentDashboard - Rendering with user:', user);
  console.log('👶 ParentDashboard - User role:', user?.role);

  useEffect(() => {
    const fetchKids = async () => {
      if (!user?.uid) return;
      try {
        const kidsData = await getMyKids(user.uid);
        useKidStore.getState().addKids(kidsData);
      } catch (error) {
        console.error('Failed to fetch kids:', error);
      }
    };

    fetchKids();
  }, [user]);

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {kids.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
              <Image
                source={require('../../../assets/home-parent/baby.png')}
                style={{ width: 24, height: 24 }}
              />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>My Kids</Text>
            </View>
            <Image source={require('../../../assets/home-parent/kid1.png')} style={{ width: 200, height: 200, marginBottom: 20 }} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333' }}>
              Keep your first child safe with Womby
            </Text>
            <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#666' }}>
              Please add your first kid
            </Text>
            <Pressable
              onPress={() => navigation.navigate('AddKidName')}
              style={{
                backgroundColor: '#31CECE',
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 25,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Image source={require('../../../assets/home-parent/baby.png')} style={{ width: 24, height: 24 }} />
              <Text style={{ color: 'white', fontWeight: '600' }}>Add first Kid</Text>
            </Pressable>
          </View>
        ) : (
          <KidSlider kids={kids} />
        )}
      </ScrollView>
    </LinearGradient>
  );
}
