import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Pressable, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import type { AppStackParamList } from '../../types/navigation';
import { useUserStore } from '../../store/userStore';
import { useKidStore } from '../../store/kidStore';
import KidSlider from '../../components/Kid/KidSlider';
import NoKidsPlaceholder from './NoKidsPlaceholder';
import { styles } from './styles/HomeScreen.styles';

export default function HomeScreen() {
  const homeNavigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const appNavigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'Home'>>();
  const focusKidId = route.params?.focusKidId;
  
  const [isLoading, setIsLoading] = useState(false);
  
  const kids = useKidStore((state) => state.kids);
  const refreshKids = useKidStore((state) => state.refreshKids);
  const user = useUserStore((state) => state.user);
  const userRole = user?.role || 'parent';

  useEffect(() => {
    const fetchKids = async () => {
      if (!user?.token) return;
      
      setIsLoading(true);
      try {
        await refreshKids(user.token);
      } catch (error) {
        console.error('❌ Error fetching kids:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKids();
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

  const handleAddKid = () => {
    // Navigate to AddKidName using the app navigation
    appNavigation.navigate('AddKidName');
  };

  return (
    <View style={styles.container}>
      {kids.length === 0 ? (
        <>
          <NoKidsPlaceholder onAdd={handleAddKid} />
          {userRole === 'parent' && (
            <Pressable onPress={handleAddKid} style={styles.addNewKidButton}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={require('../../../assets/home-parent/baby.png')} style={{ width: 24, height: 24 }} />
                <Text style={styles.addKidText}>Add first Kid</Text>
              </View>
            </Pressable>
          )}
        </>
      ) : (
        <>
          <KidSlider kids={kids} initialKidId={focusKidId} />
        </>
      )}
    </View>
  );
}
