import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Kid } from '../../store/kidStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';

interface Props {
  kid: Kid;
}

export default function KidCard({ kid }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();


  if (!kid?.vitals) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('KidProfile', { kidId: kid.id })}
      >
        <View style={styles.card}>
          <Text style={styles.name}>{kid.firstName}</Text>
          <Text style={styles.label}>No vital data available</Text>
        </View>
      </TouchableOpacity>
    );
  }


  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('KidProfile', { kidId: kid.id })}
    >
      <Text style={styles.name}>{kid.firstName}</Text>
      <Text style={styles.label}>HR: {kid.vitals.heartRate} bpm</Text>
      <Text style={styles.label}>SpO2: {kid.vitals.oximetry}%</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#DFF6F6',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    marginTop: 8,
  },
});
