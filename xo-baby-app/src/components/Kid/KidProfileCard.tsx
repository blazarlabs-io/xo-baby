// components/Kid/KidProfileCard.tsx
import React from 'react';
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { useKidStore } from '../../store/kidStore';
import AvatarHeader from './AvatarHeader';
import ProgressPoint from '../ProgressPoint';
import RealTimeDataWidget from './RealTimeDataWidget';
import Development from './Development';
import UpcomingTasks from './UpcomingTasks';
import Notes from './Notes';

export default function KidProfileCard({ kidId }: { kidId: string }) {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'KidProfile'>>();
  
    const kid = useKidStore((state) =>
      state.kids.find((k) => k.id === kidId)
    );
    console.log('store Kid:', kid, 'params Kid:', kidId);
  
    if (!kid) return <Text>Kid not found</Text>;

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={{width: '100%', flex: 1}}>
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, }}>
        <Image
          source={require('../../../assets/home-parent/baby.png')} 
          style={{ width: 24, height: 24 }}
        />
        <View><Text>My Kids</Text></View>
      </View>
      <View style={{marginTop: 16}}>
        <ProgressPoint activeCount={1} maxCount={1} />
      </View> */}
      <AvatarHeader kidID={kidId} />
      <RealTimeDataWidget heartRate={125} temperature={36} respiration={52} oxygen={98} deviceName='XO-PRO-Axs83E' kidID={kidId} />
      <Development
        lastUpdated="June. 1, 2025"
        kidID={kidId}
        data={[
          {
            id: '1',
            label: 'Weight',
            value: '5.03',
            unit: 'Kg',
            color: '#D0F8F8',
            icon: require('../../../assets/home-parent/weight.png'),
            chartData: [4.8, 4.9, 5.0, 5.03],
            chartColor: '#00BFCB',
          },
          {
            id: '2',
            label: 'Head Circ.',
            value: '32.4',
            unit: 'cm',
            color: '#FFE7F5',
            icon: require('../../../assets/home-parent/weight.png'),
            chartData: [31.9, 32.0, 32.3, 32.4],
            chartColor: '#E17BB9',
          },
          {
            id: '3',
            label: 'Height',
            value: '59.7',
            unit: 'cm',
            color: '#FFF1D5',
            icon: require('../../../assets/home-parent/weight.png'),
            chartData: [58.1, 58.6, 59.2, 59.7],
            chartColor: '#F1A93B',
          },
        ]}
      />

      <UpcomingTasks tasks = {[
        {
          id: '1',
          title: 'Dinner Meal',
          description: 'Lorem ipsum dolor sit amet...',
          dateLabel: 'Today',
          time: '18:00',
        },
        {
          id: '2',
          title: 'Pediatrician Appointment',
          description: 'Lorem ipsum dolor sit amet...',
          dateLabel: 'Oct. 23',
          time: '14:15',
        },
      ]} />
      <Notes notes={[
        {
          id: '1',
          text: 'Lorem ipsum dolor sit amet, consetur adi piscing elit, sed do mod tempor labor...',
          date: 'May 3, 2023',
          color: '#FFC8F0',
          isFavorite: true,
        },
        {
          id: '2',
          text: 'Lorem ipsum dolor sit amet, consetur adi piscing elit, sed do mod tempor labor asetum ...',
          date: 'May 3, 2023',
          color: '#C8F7F9',
        },
      ]}/>

      <TouchableOpacity onPress={() => navigation.navigate('AddKidName')} style={styles.buttonAdd}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={require('../../../assets/home-parent/baby.png')} style={{ width: 24, height: 24 }} />
          <Text style={styles.addKidText}>Add Kid</Text>
        </View>
      </TouchableOpacity>
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

