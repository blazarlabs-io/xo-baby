import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useUserStore } from '../../store/userStore';
import { useKidStore } from '../../store/kidStore';
import type { Kid } from '../../store/kidStore';
import api from '../../api/axios';
import AvatarImage from '../../components/Kid/AvatarImage';

export default function PersonnelScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [medicalPersonnel, setMedicalPersonnel] = useState<any[]>([]);
  const kids = useKidStore((state) => state.kids);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchPersonnel = async () => {
      if (!user?.token) return;
      
      setIsLoading(true);
      try {
        const response = await api.get('/users/medical-personnel');
        setMedicalPersonnel(response.data);
      } catch (error) {
        console.error('Error fetching personnel:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonnel();
  }, [user?.token]);

  const handlePersonnelPress = (personnelId: string) => {
    console.log('Personnel pressed:', personnelId);
  };

  const getKidsByDoctorId = (doctorId: string): Kid[] => {
    return kids.filter(kid => kid.doctorId === doctorId);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading personnel...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Personnel</Text>
        </View>

        {/* Personnel List */}
        <View style={styles.content}>
          {medicalPersonnel.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No personnel registered</Text>
            </View>
          ) : (
            <>
              {medicalPersonnel.map((person) => {
                const managedKids = getKidsByDoctorId(person.uid);
                
                return (
                  <Pressable
                    key={person.uid}
                    style={styles.personnelCard}
                    onPress={() => handlePersonnelPress(person.uid)}
                  >
                    <View style={styles.personnelMainRow}>
                      <View style={styles.personnelAvatar}>
                        <View style={styles.avatarWrapper}>
                          <View style={styles.avatarBorder}>
                            <Image source={require('../../../assets/common/user-doctor.png')} style={styles.avatarImage} />
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.personnelInfo}>
                        <Text style={styles.personnelName}>
                          Dr. {person.firstName} {person.lastName}
                        </Text>
                        <Text style={styles.personnelEmail}>
                          {person.email}
                        </Text>
                      </View>

                      <View style={styles.personnelStatus}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <View style={styles.activeStatusDot} />
                          <Text style={styles.activeStatusText}>Active</Text>
                        </View>
                        {managedKids.length > 0 && (
                          <View style={styles.activeKidsContainer}>
                            {managedKids.slice(0, 3).map((kid, index) => (
                              <View 
                                key={kid.id} 
                                style={[
                                  styles.activeKidAvatar,
                                  index > 0 && { marginLeft: -10 }
                                ]}
                              >
                                <AvatarImage
                                  avatarUrl={kid.avatarUrl}
                                  gender={kid.gender}
                                  style={styles.activeKidAvatarImage}
                                />
                              </View>
                            ))}
                            {managedKids.length > 3 && (
                              <View style={[styles.activeKidAvatar, styles.moreKidsIndicator, { marginLeft: -10 }]}>
                                <Text style={styles.moreKidsText}>+{managedKids.length - 3}</Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
              
              {/* New Personnel Button */}
              <Pressable style={styles.newPersonnelButton}>
                {/* <Text style={styles.newPersonnelIcon}>+</Text> */}
                <Image source={require('../../../assets/home-parent/tabs/personal-active.png')} style={styles.newPersonnelIcon} />
                <Text style={styles.newPersonnelText}>New Personnel</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFFE',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#F8FFFE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222128',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222128',
    textAlign: 'center',
  },
  personnelCard: {
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
  personnelMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  personnelAvatar: {
    marginRight: 12,
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
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  personnelInfo: {
    flex: 1,
  },
  personnelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222128',
    marginBottom: 4,
  },
  personnelEmail: {
    fontSize: 14,
    color: '#666',
  },
  personnelStatus: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  activeStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
  },
  activeStatusText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  newPersonnelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4ECDC4',
    paddingVertical: 16,
    marginTop: 16,
  },
  newPersonnelIcon: {
    width: 24,
    height: 24,
    tintColor: '#4ECDC4',
    marginRight: 8,
  },
  newPersonnelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  activeKidsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  activeKidAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  activeKidAvatarImage: {
    width: '100%',
    height: '100%',
  },
  moreKidsIndicator: {
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreKidsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 