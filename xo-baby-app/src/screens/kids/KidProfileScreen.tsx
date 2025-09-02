import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../types/navigation';
import KidProfileCard from '../../components/Kid/KidProfileCard';

type KidProfileRouteProp = RouteProp<AppStackParamList, 'KidProfile'>;

export default function KidProfileScreen() {
  const route = useRoute<KidProfileRouteProp>();
  const navigation = useNavigation();
  const { kidId } = route.params;

  console.log('👶 KidProfileScreen - Rendering for kidId:', kidId);

  return (
    <View style={styles.container}>
      {/* Back button */}
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <KidProfileCard kidId={kidId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2F3F3',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#31CECE',
  },
});
