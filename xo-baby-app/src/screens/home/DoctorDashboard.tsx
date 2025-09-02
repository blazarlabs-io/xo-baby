import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../types/navigation';
import { CommonActions } from '@react-navigation/native';
import { useUserStore } from '../../store/userStore';
import { useKidStore } from '../../store/kidStore';
import { getMyKids } from '../../api/kidApi';

interface KidListItem {
  id: string;
  firstName: string;
  lastName: string;
  age: string;
  status: 'Online' | 'Offline' | 'No device';
  batteryLevel?: number;
  vitals: {
    heartRate: number;
    temperature: number;
    diaperChanges: number;
    oxygenSaturation: number;
  };
}

export default function DoctorDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const kids = useKidStore((state) => state.kids);
  const user = useUserStore((state) => state.user);
  const [allKids, setAllKids] = useState<KidListItem[]>([]);

  console.log('👨‍⚕️ DoctorDashboard - Rendering with user:', user);
  console.log('👨‍⚕️ DoctorDashboard - User role:', user?.role);

  useEffect(() => {
    const fetchAllKids = async () => {
      if (!user?.uid) return;
      try {
        // For doctor role, fetch all kids they have access to
        const kidsData = await getMyKids(user.uid);
        useKidStore.getState().addKids(kidsData);

        // Transform data for doctor view
        const transformedKids = kidsData.map((kid: any) => ({
          id: kid.id,
          firstName: kid.firstName || 'Unknown',
          lastName: kid.lastName || 'Unknown',
          age: '21 weeks', // This should be calculated from birthDate
          status: kid.deviceConnected ? 'Online' : 'Offline',
          batteryLevel: kid.batteryLevel || 90,
          vitals: {
            heartRate: kid.vitals?.heartRate || 140,
            temperature: kid.vitals?.temperature || 36.2,
            diaperChanges: kid.vitals?.diaperChanges || 52,
            oxygenSaturation: kid.vitals?.oxygenSaturation || 98,
          },
        }));
        setAllKids(transformedKids);
      } catch (error) {
        console.error('Failed to fetch kids:', error);
      }
    };

    fetchAllKids();
  }, [user]);

  const renderKidItem = ({ item }: { item: KidListItem }) => (
    <Pressable
      style={{
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginVertical: 8,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() => {
        console.log('👨‍⚕️ DoctorDashboard - Kid clicked:', item.id, item.firstName, item.lastName);
        navigation.dispatch(
          CommonActions.navigate({
            name: 'KidProfile',
            params: { kidId: item.id },
          })
        );
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Image
          source={require('../../../assets/home-parent/baby.png')}
          style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={{ fontSize: 14, color: '#666' }}>{item.age}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{
            backgroundColor: item.status === 'Online' ? '#4CAF50' : '#F44336',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            marginBottom: 4
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
              {item.status}
            </Text>
          </View>
          {item.batteryLevel && (
            <Text style={{ fontSize: 12, color: '#666' }}>
              {item.batteryLevel}%
            </Text>
          )}
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center' }}>
          <Image source={require('../../../assets/home-parent/heart.png')} style={{ width: 20, height: 20 }} />
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{item.vitals.heartRate}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Image source={require('../../../assets/home-parent/temperature.png')} style={{ width: 20, height: 20 }} />
          <Text style={{
            fontSize: 12,
            color: item.vitals.temperature > 37 ? '#F44336' : '#666',
            marginTop: 4
          }}>
            {item.vitals.temperature}
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Image source={require('../../../assets/home-parent/diaper.png')} style={{ width: 20, height: 20 }} />
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{item.vitals.diaperChanges}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Image source={require('../../../assets/home-parent/oxygen.png')} style={{ width: 20, height: 20 }} />
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{item.vitals.oxygenSaturation}%</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          marginTop: 16,
          marginBottom: 20
        }}>
          <Image
            source={require('../../../assets/home-parent/baby.png')}
            style={{ width: 24, height: 24 }}
          />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>My Kids</Text>
        </View>

        {allKids.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 18, color: '#666', textAlign: 'center' }}>
              No kids assigned to you yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={allKids}
            renderItem={renderKidItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 10 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </LinearGradient>
  );
}
