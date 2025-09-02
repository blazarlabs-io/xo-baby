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

interface PersonnelItem {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Not Active';
  patients: string[];
}

export default function AdminDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const kids = useKidStore((state) => state.kids);
  const user = useUserStore((state) => state.user);
  const [allKids, setAllKids] = useState<KidListItem[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelItem[]>([]);

  console.log('🏥 AdminDashboard - Rendering with user:', user);
  console.log('🏥 AdminDashboard - User role:', user?.role);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;
      try {
        // Fetch kids data
        const kidsData = await getMyKids(user.uid);
        useKidStore.getState().addKids(kidsData);

        // Transform kids data for admin view
        const transformedKids = kidsData.map((kid: any) => ({
          id: kid.id,
          firstName: kid.firstName || 'Unknown',
          lastName: kid.lastName || 'Unknown',
          age: '21 weeks',
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

        // Mock personnel data - in real app, this would come from API
        const mockPersonnel: PersonnelItem[] = [
          {
            id: '1',
            name: 'Dr. Kosy Dwell',
            email: 'kosydoctor@hospital.com',
            status: 'Active',
            patients: ['Patient 1', 'Patient 2', 'Patient 3'],
          },
          {
            id: '2',
            name: 'Dr. Kosy Dwell',
            email: 'kosydoctor@hospital.com',
            status: 'Not Active',
            patients: ['Patient 1', 'Patient 2', 'Patient 3'],
          },
        ];
        setPersonnel(mockPersonnel);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
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

  const renderPersonnelItem = ({ item }: { item: PersonnelItem }) => (
    <View style={{
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
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          width: 50,
          height: 50,
          backgroundColor: '#E2F3F3',
          borderRadius: 25,
          marginRight: 12,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 20 }}>👨‍⚕️</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 14, color: '#666' }}>{item.email}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{
            backgroundColor: item.status === 'Active' ? '#4CAF50' : '#F44336',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            marginBottom: 4
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
              {item.status}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 4 }}>
            {item.patients.slice(0, 3).map((_, index) => (
              <View
                key={index}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#E2F3F3',
                  marginLeft: index > 0 ? -8 : 0,
                  borderWidth: 1,
                  borderColor: 'white',
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
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
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>My Facility</Text>
        </View>

        {/* Facility Banner */}
        <View style={{
          backgroundColor: 'white',
          marginHorizontal: 20,
          marginBottom: 20,
          padding: 20,
          borderRadius: 12,
          alignItems: 'center',
        }}>
          <View style={{
            width: 80,
            height: 80,
            backgroundColor: '#31CECE',
            borderRadius: 40,
            marginBottom: 10,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>🏥</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Blazar Hospital</Text>
        </View>

        {/* My Kids Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginHorizontal: 20,
            marginBottom: 10
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>My Kids</Text>
            <Pressable>
              <Text style={{ color: '#31CECE', fontSize: 14 }}>See All {'>'}</Text>
            </Pressable>
          </View>

          {allKids.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ color: '#666' }}>No kids in facility</Text>
            </View>
          ) : (
            <FlatList
              data={allKids.slice(0, 2)}
              renderItem={renderKidItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}

          <Pressable
            style={{
              borderWidth: 2,
              borderColor: '#31CECE',
              borderStyle: 'dashed',
              marginHorizontal: 20,
              marginTop: 10,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8
            }}
            onPress={() => navigation.navigate('AddKidName')}
          >
            <Image source={require('../../../assets/home-parent/plus.png')} style={{ width: 20, height: 20 }} />
            <Text style={{ color: '#31CECE', fontWeight: '600' }}>New Kid</Text>
          </Pressable>
        </View>

        {/* My Personnel Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginHorizontal: 20,
            marginBottom: 10
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>My Personnel</Text>
            <Pressable>
              <Text style={{ color: '#31CECE', fontSize: 14 }}>See All {'>'}</Text>
            </Pressable>
          </View>

          {personnel.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ color: '#666' }}>No personnel in facility</Text>
            </View>
          ) : (
            <FlatList
              data={personnel.slice(0, 2)}
              renderItem={renderPersonnelItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}

          <Pressable
            style={{
              borderWidth: 2,
              borderColor: '#31CECE',
              borderStyle: 'dashed',
              marginHorizontal: 20,
              marginTop: 10,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8
            }}
            onPress={() => navigation.navigate('AddKidName')}
          >
            <Image source={require('../../../assets/home-parent/plus.png')} style={{ width: 20, height: 20 }} />
            <Text style={{ color: '#31CECE', fontWeight: '600' }}>New Personnel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
