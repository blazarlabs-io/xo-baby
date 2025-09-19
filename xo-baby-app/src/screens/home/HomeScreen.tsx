import React, { useEffect, useRef, useState } from 'react';
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
import type { HomeStackParamList } from '@/navigation/HomeStack';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'HomeScreen'>>();

  const route = useRoute<RouteProp<HomeStackParamList, 'Home'>>();
  const focusKidId = route.params?.focusKidId;

  // Add loading state and request tracking
  const [isLoading, setIsLoading] = useState(false);
  const fetchRequestRef = useRef<Promise<any> | null>(null);
  const lastTokenRef = useRef<string | null>(null);

  const kids = useKidStore((state) => state.kids);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const fetchKids = async () => {
      // Only use token as dependency, not entire user object
      const currentToken = user?.token;

      if (!currentToken) {
        // Clear kids if no token
        if (isMounted) {
          useKidStore.getState().clearKids();
        }
        return;
      }

      // Prevent duplicate requests with same token
      if (currentToken === lastTokenRef.current && fetchRequestRef.current) {
        console.log('🔄 Request already in progress, skipping...');
        return fetchRequestRef.current;
      }

      // Prevent multiple requests while loading
      if (isLoading) {
        console.log('🔄 Already loading, skipping...');
        return;
      }

      console.log('🚀 Starting kids fetch request...');
      if (isMounted) {
        setIsLoading(true);
      }
      lastTokenRef.current = currentToken;

      try {
        // Create and store the request promise
        const requestPromise = getMyKids(currentToken);
        fetchRequestRef.current = requestPromise;

        const kids = await requestPromise;

        // Only update if component is still mounted
        if (isMounted) {
          console.log('✅ Fetched kids from API:', kids);
          console.log('📊 Kids data details:', {
            isArray: Array.isArray(kids),
            length: kids?.length,
            firstKid: kids?.[0] ? {
              id: kids[0].id,
              firstName: kids[0].firstName,
              lastName: kids[0].lastName
            } : null
          });

          // Always set kids from API response (empty array if no kids)
          useKidStore.getState().setKids(kids || []);
          console.log('🏪 Updated store with kids data');
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ Failed to fetch kids:', error);
          // On error, also clear kids to avoid showing stale data
          useKidStore.getState().clearKids();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
        fetchRequestRef.current = null;
      }
    };

    fetchKids();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user?.token]); // Only depend on token, not entire user object


  console.log('🔍 HomeScreen State:', {
    isLoading,
    kidsCount: kids.length,
    hasToken: !!user?.token,
    kids: kids.map(k => ({ id: k.id, firstName: k.firstName, lastName: k.lastName }))
  });

  // Show loading spinner while fetching data
  if (isLoading && kids.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#31CECE" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666', textAlign: 'center' }}>
          Loading your kids data...{'\n'}
          This may take a moment as we fetch from the blockchain
        </Text>
      </View>
    );
  }

  // Add refresh function for debugging
  const handleRefresh = async () => {
    if (user?.token && !isLoading) {
      setIsLoading(true);
      try {
        const kids = await getMyKids(user.token);
        useKidStore.getState().setKids(kids || []);
        console.log('🔄 Manual refresh completed');
      } catch (error) {
        console.error('❌ Manual refresh failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Debug refresh button - remove in production */}
      {__DEV__ && (
        <Pressable
          onPress={handleRefresh}
          style={{ position: 'absolute', top: 50, right: 20, zIndex: 1000, padding: 10, borderRadius: 5 }}
        >
          {/* <Text style={{ color: 'white', fontSize: 12 }}>Refresh</Text> */}
        </Pressable>
      )}

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
          <KidSlider kids={kids} initialKidId={focusKidId} />
        </>
      )}
    </View>
  );

}
