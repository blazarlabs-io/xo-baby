import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
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
  const isLoading = useKidStore((state) => state.isLoading);
  const error = useKidStore((state) => state.error);
  const user = useUserStore((state) => state.user);
  const hasFetchedRef = useRef(false);

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

  console.log('🔍🔍 User:', user);

  useEffect(() => {
    console.log('🔍🔍🔍 User:', user);

    const fetchKids = async () => {
      if (!user?.uid) {
        useKidStore.getState().setError('User not authenticated');
        return;
      }

      if (hasFetchedRef.current) {
        return; // Prevent multiple fetches
      }

      hasFetchedRef.current = true;

      try {
        useKidStore.getState().setLoading(true);
        useKidStore.getState().setError(null);
        console.log('🚀 Starting to fetch kids for UID:', user.uid);

        const kidsData = await getMyKids(user.uid);
        console.log('✅ Received kids from API:', kidsData);
        useKidStore.getState().addKids(kidsData);
      } catch (error) {
        console.error('❌ Failed to fetch kids:', error);
        useKidStore.getState().setError(error instanceof Error ? error.message : 'Failed to fetch kids data');
        hasFetchedRef.current = false; // Allow retry on error
      }
    };

    if (user?.uid && !isLoading && kids.length === 0 && !error && !hasFetchedRef.current) {
      fetchKids();
    }
  }, [user?.uid, isLoading, kids.length, error]);


  console.log('Kids:', kids);
  console.log('User:', user);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your kids...</Text>
          <Text style={styles.loadingSubtext}>
            Please wait while we process your data securely.{'\n'}
            This includes blockchain verification, IPFS retrieval, and data decryption.{'\n'}
            This process may take a few minutes.
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load kids data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable
            onPress={() => {
              if (user?.uid) {
                hasFetchedRef.current = false; // Reset fetch flag
                useKidStore.getState().setError(null);
                // Clear existing kids to trigger fresh fetch
                useKidStore.getState().clearKids();
              }
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    if (kids.length === 0) {
      return (
        <>
          <NoKidsPlaceholder onAdd={() => navigation.navigate('AddKidName')} />
          <Pressable onPress={() => navigation.navigate('AddKidName')} style={styles.addNewKidButton}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={require('../../../assets/home-parent/baby.png')} style={{ width: 24, height: 24 }} />
              <Text style={styles.addKidText}>Add first Kid</Text>
            </View>
          </Pressable>
        </>
      );
    }

    return <KidSlider kids={kids} />;
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );

}
