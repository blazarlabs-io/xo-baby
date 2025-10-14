import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { useUserStore } from '@/store/userStore';
import { useKidStore } from '@/store/kidStore';
import { logoutAll } from '@/services/logout';

interface SettingsScreensProps {
  kidId?: string;
}

interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const SettingsScreen = ({ kidId} : SettingsScreensProps = {}) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'Devices'>>();
  const user = useUserStore( s => s.user );
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (!user?.uid || !user?.token) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/${user.uid}/profile`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      } else {
        console.warn('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAll();
    } catch (e) {
      console.warn('Logout error', e);
      Alert.alert('Logout', 'Error, try again');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement delete account functionality
            Alert.alert('Delete Account', 'This feature will be implemented soon.');
          },
        },
      ]
    );
  };

  const handleMenuPress = (menu: string) => {
    // TODO: Navigate to respective screens
    Alert.alert(menu, 'This feature will be implemented soon.');
  };

  const displayName = userProfile 
    ? `${userProfile.firstName} ${userProfile.lastName}` 
    : user?.email?.split('@')[0] || 'User';
  const displayEmail = userProfile?.email || user?.email || '';

  // Get avatar based on user role
  const getAvatarSource = () => {
    const role = user?.role || 'parent';
    switch (role) {
      case 'admin':
        return require('../../../assets/common/user-doctor.png');
      case 'medical':
        return require('../../../assets/common/user-doctor.png');
      case 'parent':
      default:
        return require('../../../assets/common/user-parent.png');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../../assets/home-parent/tabs/settings-active.png')}
          style={{ width: 24, height: 24 }} 
        />
        <Text style={styles.headerText}>Settings</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#31CECE" />
        </View>
      ) : (
        <View style={styles.content}>
          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={getAvatarSource()}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            <Pressable 
              style={styles.menuItem}
              onPress={() => handleMenuPress('App Settings')}
            >
              <Text style={styles.menuText}>App Settings</Text>
              <Image
                source={require('../../../assets/common/chevron-left.png')}
                style={styles.chevronRight}
              />
            </Pressable>

            <Pressable 
              style={styles.menuItem}
              onPress={() => handleMenuPress('Technical Support')}
            >
              <Text style={styles.menuText}>Technical Support</Text>
              <Image
                source={require('../../../assets/common/chevron-left.png')}
                style={styles.chevronRight}
              />
            </Pressable>

            <Pressable 
              style={styles.menuItem}
              onPress={() => handleMenuPress('FAQ')}
            >
              <Text style={styles.menuText}>FAQ</Text>
              <Image
                source={require('../../../assets/common/chevron-left.png')}
                style={styles.chevronRight}
              />
            </Pressable>
          </View>

          {/* Logout Button */}
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>

          {/* Delete Account Button */}
          <Pressable onPress={handleDeleteAccount}>
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#E8F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    gap: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#222128',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  profileSection: {
    // backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#31CECE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
    color: '#222128',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#222128',
  },
  chevronRight: {
    width: 20,
    height: 20,
    transform: [{ rotate: '180deg' }],
    tintColor: '#666',
  },
  logoutBtn: {
    backgroundColor: '#31CECE',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  deleteAccountText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#222128',
    textAlign: 'center',
  },
});
