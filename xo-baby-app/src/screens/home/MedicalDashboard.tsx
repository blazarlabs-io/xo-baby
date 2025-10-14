import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { useUserStore } from '../../store/userStore';
import { useKidStore } from '../../store/kidStore';
import AvatarImage from '../../components/Kid/AvatarImage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MedicalDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);
  const kids = useKidStore((state) => state.kids);
  const refreshKids = useKidStore((state) => state.refreshKids);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchKids = async () => {
      if (!user?.token) return;
      
      setIsLoading(true);
      try {
        await refreshKids(user.token);
      } catch (error) {
        console.error('Error fetching kids:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKids();
  }, [user?.token, refreshKids]);

  const handleKidPress = (kidId: string) => {
    // Navigate to Home screen with the selected kid, giving doctors the same detailed view as parents
    navigation.navigate('Home', { focusKidId: kidId });
  };

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Unknown age';
    
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    
    if (weeks < 4) {
      return `${diffDays} days`;
    } else if (weeks < 52) {
      return `${weeks} weeks`;
    } else {
      const years = Math.floor(weeks / 52);
      const remainingWeeks = weeks % 52;
      return remainingWeeks > 0 ? `${years}y ${remainingWeeks}w` : `${years} years`;
    }
  };

  // Get status color based on vitals
  const getStatusColor = (kid: any) => {
    const heartRate = kid.vitals?.heartRate || 0;
    const oximetry = kid.vitals?.oximetry || 0;
    const temperature = kid.vitals?.temperature || 0;
    
    // Normal ranges for infants
    if (heartRate > 0 && heartRate >= 100 && heartRate <= 160 &&
        oximetry > 0 && oximetry >= 95 &&
        temperature > 0 && temperature >= 36.5 && temperature <= 37.5) {
      return '#4CAF50'; // Green - Normal
    } else if (heartRate > 0 || oximetry > 0 || temperature > 0) {
      return '#FF9800'; // Orange - Needs attention
    }
    return '#9E9E9E'; // Gray - No data
  };

  // Get status text
  const getStatusText = (kid: any) => {
    const heartRate = kid.vitals?.heartRate || 0;
    const oximetry = kid.vitals?.oximetry || 0;
    const temperature = kid.vitals?.temperature || 0;
    
    if (heartRate > 0 && oximetry > 0 && temperature > 0) {
      return 'Online';
    } else if (heartRate > 0 || oximetry > 0 || temperature > 0) {
      return 'Partial';
    }
    return 'Offline';
  };

  // Check if there are any warnings for the kid
  const hasWarnings = (kid: any) => {
    const heartRate = kid.vitals?.heartRate || 140;
    const oximetry = kid.vitals?.oximetry || 93;
    const temperature = kid.vitals?.temperature || 36.6;
    const battery = 90; // This would come from kid data in real implementation
    
    // Check for abnormal vitals
    // Heart rate: normal range 100-160 bpm for infants
    if (heartRate < 100 || heartRate > 160) return true;
    
    // Oxygen saturation: should be >= 95%
    if (oximetry < 95) return true;
    
    // Temperature: normal range 36.5-37.5°C
    if (temperature < 36.5 || temperature > 37.5) return true;
    
    // Battery: warn if below 20%
    if (battery < 20) return true;
    
    return false;
  };

  // Check if individual vitals are abnormal
  const isHeartRateAbnormal = (heartRate: number) => {
    return heartRate < 100 || heartRate > 160;
  };

  const isTemperatureAbnormal = (temperature: number) => {
    return temperature < 36.5 || temperature > 37.5;
  };

  const isOximetryAbnormal = (oximetry: number) => {
    return oximetry < 95;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading kids...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../../assets/home-parent/baby.png')} 
          style={styles.headerIcon}
        />
        <Text style={styles.headerTitle}>My Kids</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {kids.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Patients Assigned</Text>
            <Text style={styles.emptyStateSubtitle}>
              You don't have any patients assigned to you yet.
            </Text>
          </View>
        ) : (
          <View style={styles.kidsContainer}>
            {kids.map((kid, index) => (
              <Pressable
                key={kid.id}
                style={styles.kidCard}
                onPress={() => handleKidPress(kid.id)}
              >
                {/* Warning Bell Icon */}
                {hasWarnings(kid) && (
                  <View style={styles.warningBellContainer}>
                    <View style={styles.warningBellBackground}>
                      <MaterialCommunityIcons 
                        name="bell-ring-outline" 
                        size={24} 
                        color="#FF4444" 
                      />
                    </View>
                  </View>
                )}

                {/* Main Content Row: Avatar + Kid Info */}
                <View style={styles.mainContentRow}>
                  {/* Kid Avatar */}
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarWrapper}>
                      <View style={styles.avatarBorder}>
                        <AvatarImage
                          avatarUrl={kid.avatarUrl}
                          gender={kid.gender}
                          style={styles.avatar}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Kid Info (Name, Age, Status) */}
                  <View style={styles.kidInfoSection}>
                    <View style={styles.nameAndStatusRow}>
                      <Text style={styles.kidName}>
                        {kid.firstName} {kid.lastName}
                      </Text>
                      <View style={styles.statusAndBatteryContainer}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(kid) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(kid) }]}>
                          {getStatusText(kid)}
                        </Text>
                        <Text style={styles.batteryText}>90%</Text>
                        <View style={styles.batteryIcon}>
                          <View style={styles.batteryFill} />
                        </View>
                      </View>
                    </View>
                    <Text style={styles.kidAge}>
                      {calculateAge(kid.birthDate)}
                    </Text>
                  </View>
                </View>

                {/* Vitals Row - Full Width at Bottom */}
                <View style={styles.vitalsRow}>
                  {/* Heart Rate */}
                  <View style={[
                    styles.vitalItem,
                    isHeartRateAbnormal(kid.vitals?.heartRate || 140) && styles.vitalItemWarning
                  ]}>
                    <View style={styles.heartIcon}>
                      <Image source={require('../../../assets/home-parent/heart.png')} style={styles.heartIcon} />
                    </View>
                    <Text style={styles.vitalValue}>
                      {kid.vitals?.heartRate || 140}
                    </Text>
                  </View>

                  {/* Temperature */}
                  <View style={[
                    styles.vitalItem,
                    isTemperatureAbnormal(kid.vitals?.temperature || 36.6) && styles.vitalItemWarning
                  ]}>
                    <View style={styles.tempIcon}>
                      <Image source={require('../../../assets/home-parent/thermometer.png')} style={styles.tempIcon} />
                    </View>
                    <Text style={styles.vitalValue}>
                      {kid.vitals?.temperature || 36.6}
                    </Text>
                  </View>

                  {/* Oxygen */}
                  <View style={[
                    styles.vitalItem,
                    isOximetryAbnormal(kid.vitals?.oximetry || 93) && styles.vitalItemWarning
                  ]}>
                    <View style={styles.oxygenIcon}>
                      <Image source={require('../../../assets/home-parent/lungs.png')} style={styles.oxygenIcon} />
                    </View>
                    <Text style={styles.vitalValue}>
                      {kid.vitals?.oximetry || 93}
                    </Text>
                  </View>

                  {/* Overall Health */}
                  <View style={styles.vitalItem}>
                    <View style={styles.healthIcon}>
                      <Image source={require('../../../assets/home-parent/O2.png')} style={styles.healthIcon} />
                    </View>
                    <Text style={styles.vitalValue}>98%</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2F3F3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    gap: 8,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222128',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 100, // Add bottom padding to ensure content is scrollable
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
    minHeight: 400, // Ensure minimum height for proper centering
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222128',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  kidsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  kidCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    alignSelf: 'flex-start',
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#31CECE',
    borderRadius: 32,
    padding: 3,
  },
  avatarBorder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 29,
    padding: 2,
    width: 58,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mainContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  kidInfoSection: {
    flex: 1,
    marginLeft: 16,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    // marginBottom: 4,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kidName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222128',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  batteryText: {
    fontSize: 12,
    color: '#666',
  },
  batteryIcon: {
    width: 20,
    height: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 1,
  },
  batteryFill: {
    width: '90%',
    height: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 1,
  },
  kidAge: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  vitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vitalItemWarning: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  heartIcon: {
    // width: 32,
    // height: 32,
    // borderRadius: 16,
    // backgroundColor: '#FFE7E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartSymbol: {
    fontSize: 16,
    color: '#FF4444',
  },
  tempIcon: {
    // width: 32,
    // height: 32,
    // borderRadius: 16,
    // backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempSymbol: {
    fontSize: 14,
  },
  oxygenIcon: {
    // width: 32,
    // height: 32,
    // borderRadius: 16,
    // backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oxygenSymbol: {
    fontSize: 14,
  },
  healthIcon: {
    // width: 32,
    // height: 32,
    // borderRadius: 16,
    // backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthSymbol: {
    fontSize: 14,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222128',
  },
  nameAndStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusAndBatteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  warningBellContainer: {
    position: 'absolute',
    top: -20,
    right: -20,
    zIndex: 10,
  },
  warningBellBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
}); 