// system imports
import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
// Navigation
import { AppStackParamList } from '../../types/navigation';
// Components imports
import AvatarHeader from './AvatarHeader';
import RealTimeDataWidget from './RealTimeDataWidget';
import Development, { DevelopmentItem } from './Development';
import UpcomingTasks from './UpcomingTasks';
import Notes from './Notes';
// API
import { getWeightRecords, getHeightRecords, getHeadCircumferenceRecords } from '@/api/measurementsApi';
// Store
import { useUserStore } from '@/store/userStore';
import { useKidStore } from '../../store/kidStore';

export default function KidProfileCard({ kidId }: { kidId: string }) {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'KidProfile'>>();
  // token validation temporarily disabled for development
  // const user = useUserStore(state => state.user);
  // const token = user?.token || '';
  const kid = useKidStore((state) =>
    state.kids.find((k) => k.id === kidId)
  );

  const [loading, setLoading] = useState(true);
  const [weightData, setWeightData] = useState<number[]>([]);
  const [heightData, setHeightData] = useState<number[]>([]);
  const [headData, setHeadData] = useState<number[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    if (!kidId) return;
    setLoading(true);
    Promise.all([
      getWeightRecords(kidId),
      getHeightRecords(kidId),
      getHeadCircumferenceRecords(kidId),
    ])
      .then(([weights, heights, heads]) => {
        // fill chart data
        setWeightData(weights.map((r) => r.value));
        setHeightData(heights.map((r) => r.value));
        setHeadData(heads.map((r) => r.value));

        // derive the most recent date across all three measurements
        const allDates = [...weights, ...heights, ...heads]
          .map((r) => new Date(r.date));
        const maxTs = Math.max(...allDates.map((d) => d.getTime()));
        const mostRecent = new Date(maxTs);
        // format: e.g. "June 30, 2025"
        setLastUpdated(
          mostRecent.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        );
      })
      .catch(err => console.error('Error loading measurements:', err))
      .finally(() => setLoading(false));
  }, [kidId]);

  if (!kid) return <Text>Kid not found</Text>;

  // derive latest values from fetched data
  const latestWeight = weightData.length > 0 ? weightData[weightData.length - 1] : undefined;
  const latestHeight = heightData.length > 0 ? heightData[heightData.length - 1] : undefined;
  const latestHead = headData.length > 0 ? headData[headData.length - 1] : undefined;

  // Static UI details
  const developmentItems: DevelopmentItem[] = [
    {
      id: 'weight',
      label: 'Weight',
      value: latestWeight || '--',
      unit: 'Kg',
      color: '#D0F8F8',
      icon: require('../../../assets/home-parent/weight.png'),
      chartData: weightData,
      chartColor: '#00BFCB',
    },
    {
      id: 'head',
      label: 'Head Circ.',
      value: latestHead || '--',
      unit: 'cm',
      color: '#FFE7F5',
      icon: require('../../../assets/home-parent/head.png'),
      chartData: headData,
      chartColor: '#E17BB9',
    },
    {
      id: 'height',
      label: 'Height',
      value: latestHeight || '--',
      unit: 'cm',
      color: '#FFF1D5',
      icon: require('../../../assets/home-parent/height.png'),
      chartData: heightData,
      chartColor: '#F1A93B',
    },
  ];

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={{ width: '100%', flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <AvatarHeader kidID={kidId} />
        <RealTimeDataWidget kidID={kidId} />
        <Development
          lastUpdated={lastUpdated}
          kidID={kidId}
          data={developmentItems}
        />
        <UpcomingTasks kidID={kidId} />
        <Notes kidID={kidId} />

        <Pressable onPress={() => navigation.navigate('AddKidName')} style={styles.buttonAdd}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={require('../../../assets/home-parent/baby.png')} style={{ width: 24, height: 24 }} />
            <Text style={styles.addKidText}>Add Kid</Text>
          </View>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginVertical: 4,
  },
  buttonAdd: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 160,
    borderWidth: 1,
    borderColor: '#31CECE',
    borderRadius: 32,
    borderStyle: 'dashed',
    width: '100%',
    height: 48,
    paddingHorizontal: 32,
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 8
  },
  addKidText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#31cece",
    textAlign: "left"
  },
});

