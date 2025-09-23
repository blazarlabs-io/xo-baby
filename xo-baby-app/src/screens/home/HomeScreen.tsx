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
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'Home'>>();
  const focusKidId = route.params?.focusKidId;
  const [isLoading, setIsLoading] = useState(false);
  const fetchRequestRef = useRef<Promise<any> | null>(null);
  const lastTokenRef = useRef<string | null>(null);
  const kids = useKidStore((state) => state.kids);
  const refreshKids = useKidStore((state) => state.refreshKids);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    console.log('🔄 Kids state changed in HomeScreen:', {
      count: kids.length,
      kids: kids.map(k => ({ id: k.id, firstName: k.firstName, lastName: k.lastName }))
    });
  }, [kids]);

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const fetchKids = async () => {
      const currentToken = user?.token;
      if (!currentToken) {
        if (isMounted) {
          useKidStore.getState().clearKids();
        }
        return;
      }

      if (currentToken === lastTokenRef.current && fetchRequestRef.current) {
        return fetchRequestRef.current;
      }

      if (isLoading) {
        return;
      }

      if (isMounted) {
        setIsLoading(true);
      }
      lastTokenRef.current = currentToken;

      try {
        const requestPromise = getMyKids(currentToken);
        fetchRequestRef.current = requestPromise;
        const kids = await requestPromise;
        if (isMounted) {
          console.log('📊 Kids data details:', {
            isArray: Array.isArray(kids),
            length: kids?.length,
            allKids: kids?.map((k: any) => ({ id: k.id, firstName: k.firstName, lastName: k.lastName }))
          });

          const kidsToSet = kids || [];
          useKidStore.getState().setKids(kidsToSet);
          const storeKids = useKidStore.getState().kids;
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ Failed to fetch kids:', error);
          useKidStore.getState().clearKids();
          setIsLoading(false);
        }
      } finally {
        fetchRequestRef.current = null;
      }
    };

    fetchKids();

    return () => {
      isMounted = false;
    };
  }, [user?.token]); // Only depend on token, not entire user object

  const shouldShowLoading = isLoading && kids.length === 0;
  
  if (shouldShowLoading) {
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
  
  const handleRefresh = async () => {
    if (user?.token && !isLoading) {
      setIsLoading(true);
      try {
        await refreshKids(user.token);
      } catch (error) {
        console.error('❌ Manual refresh failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
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
