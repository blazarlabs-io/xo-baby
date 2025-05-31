import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../types/navigation';
import { useUserStore } from '../../store/userStore';

type KidProfileRouteProp = RouteProp<AppStackParamList, 'KidProfile'>;

export default function KidProfileScreen() {
  const route = useRoute<KidProfileRouteProp>();
  const { kidId } = route.params;

  const kid = useUserStore((state) =>
    state.kids.find((k) => k.id === kidId)
  );

  if (!kid) return <Text>Kid not found</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{kid.name}</Text>
      <Text style={styles.label}>Birth Date: {kid.birthDate}</Text>
      <Text style={styles.label}>Heart Rate: {kid.vitals.heartRate} bpm</Text>
      <Text style={styles.label}>Oximetry: {kid.vitals.oximetry}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
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
});
