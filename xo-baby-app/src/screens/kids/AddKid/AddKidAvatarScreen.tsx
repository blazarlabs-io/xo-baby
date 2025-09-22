import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, Platform, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../types/navigation';

import { useKidStore } from '../../../store/kidStore';
import { createKid } from '../../../api/kidApi';
import { useUserStore } from '../../../store/userStore';
import LoadingModal from '../../../components/LoadingModal';
import TransactionSuccessModal from '../../../components/TransactionSuccessModal';


export default function AddKidAvatarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'AddKidAvatar'>>();
  const route = useRoute<RouteProp<AppStackParamList, 'AddKidAvatar'>>();

  const { user } = useUserStore();
  const addKid = useKidStore((state) => state.addKid);
  const refreshKids = useKidStore((state) => state.refreshKids);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'blockchain' | 'encrypting' | 'uploading' | 'finalizing'>('blockchain');
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [createdKidId, setCreatedKidId] = useState<string>('');

  // Handle success modal close and navigation
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Tabs' as never,
          params: {
            screen: 'MyKids',
            params: {
              screen: 'Home',
              params: { focusKidId: createdKidId },
            },
          } as never,
        },
      ],
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [progressInterval]);

  const {
    firstName,
    lastName,
    gender,
    birthday,
    bloodtype,
    ethnicity,
    location,
    anomalies
  } = route.params;

  const handleCreateKid = async () => {
    if (isCreating) return;

    setIsCreating(true);
    setLoadingStage('blockchain');

    try {
      console.log('Starting kid creation process...');

      // Start the API call
      const createKidPromise = createKid({
        firstName,
        lastName,
        birthDate: birthday,
        gender,
        bloodType: bloodtype,
        ethnicity,
        location,
        congenitalAnomalies: anomalies,
        avatarUrl: '',
        parentId: user?.uid || 'R5YlNjanoRQTkDOuayTGTqZQZEs1',
      });

      // Simulate progress stages while waiting for the API
      const interval = setInterval(() => {
        setLoadingStage(prev => {
          switch (prev) {
            case 'blockchain':
              return 'encrypting';
            case 'encrypting':
              return 'uploading';
            case 'uploading':
              return 'finalizing';
            default:
              return 'finalizing';
          }
        });
      }, 30000); // Change stage every 30 seconds

      setProgressInterval(interval);

      // Wait for the API call to complete
      const response = await createKidPromise;

      // Clear the progress interval
      if (interval) {
        clearInterval(interval);
        setProgressInterval(null);
      }

      // Set final stage
      setLoadingStage('finalizing');

      // Small delay to show finalizing stage
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Create kid response:', response);
      const newKid = response.kidData;

      if (!newKid || !newKid.id) {
        throw new Error('Invalid response: missing kid data or ID');
      }

      // Store the transaction hash and kid ID from the response
      const txHash = response.kidData.nftTxHash || response.nftTxHash || '';
      if (txHash) {
        setTransactionHash(txHash);
        console.log('Transaction hash received:', txHash);
      } else {
        console.warn('No transaction hash found in response');
        setTransactionHash('Transaction hash not available');
      }
      setCreatedKidId(newKid.id);

      addKid(newKid);
      
      // Refresh kids data from backend to get complete blockchain data
      if (user?.token) {
        console.log('🔄 Refreshing kids data from backend after creation...');
        try {
          await refreshKids(user.token);
          console.log('✅ Successfully refreshed kids data after creation');
        } catch (error) {
          console.warn('⚠️ Failed to refresh kids data after creation, but kid was created locally:', error);
        }
      }
      
      // Show the transaction success modal instead of navigating immediately
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Failed to create kid:', error);

      let errorMessage = 'Failed to create kid. Please try again.';

      if (error.message?.includes('Network Error') || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network connection issue. Please check your internet connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'The operation is taking longer than expected. Please try again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again in a few minutes.';
      }

      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      // Clean up any remaining interval
      if (progressInterval) {
        clearInterval(progressInterval);
        setProgressInterval(null);
      }
      setIsCreating(false);
    }
  };


  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <View style={{ height: 24, flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Image source={require('../../../../assets/common/chevron-left.png')} width={24} height={24} />
        </Pressable>
        <View style={styles.headerText}><Text>Add Kid</Text></View>
      </View>
      <View style={{ marginTop: 24, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ gap: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.progressPointActive} ></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
        </View>
      </View>
      <View style={{ marginTop: 24, maxWidth: 266 }}>
        <Text style={styles.title}>Kid's avatar</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.contentTitle}>Choose Avatar</Text>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Image
              source={require('../../../../assets/kids/avatar-girl.png')}
              style={{ width: 48, height: 48, borderRadius: 80 }} />
          </View>
          <View style={styles.avatar}>
            <Image
              source={require('../../../../assets/kids/avatar-boy.png')}
              style={{ width: 48, height: 48, borderRadius: 80 }} />
          </View>
        </View>
        <Text style={[styles.contentTitle, { marginTop: 4, color: '#7c768a' }]}>Or</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 16 }}>
          <Image source={require('../../../../assets/common/image.png')} style={{ width: 16, height: 16 }} />
          <Text style={styles.uploadImageText}>Choose from library</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 }}>
          <Image source={require('../../../../assets/common/device-camera.png')} style={{ width: 16, height: 16 }} />
          <Text style={styles.uploadImageText}>Take a photo</Text>
        </View>
      </View>


      <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' }}>
        <Pressable
          style={[styles.button, isCreating && styles.buttonDisabled]}
          onPress={handleCreateKid}
          disabled={isCreating}
        >
          <Text style={styles.buttonText}>Create Kid</Text>
        </Pressable>
        {!isCreating && (
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        )}
      </View>

      <LoadingModal visible={isCreating} stage={loadingStage} />
      
      <TransactionSuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        transactionHash={transactionHash}
        kidName={`${firstName} ${lastName}`}
      />

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backBtn: { borderWidth: 1, borderColor: '#CACACA', width: 24, height: 24, borderRadius: 4, cursor: 'pointer', position: 'absolute', left: 0, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, padding: 24, },
  headerText: { fontSize: 16, fontWeight: 'bold', justifyContent: 'center', textAlign: 'center' },
  progressPointActive: { width: 12, height: 12, borderRadius: 50, backgroundColor: '#31CECE' },
  progressPoint: { width: 12, height: 12, borderRadius: 50, backgroundColor: '#CACACA' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 42, letterSpacing: 1.5, color: '#222128' },
  button: {
    backgroundColor: '#31CECE',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    maxWidth: 320,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.7 },
  backText: { textAlign: 'center', marginTop: 10, color: '#999' },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 16,
  },
  contentTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Poppins-Regular",
    color: "#222128",
    textAlign: "left"
  },
  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4
  },
  avatar: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  uploadImageText: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#31cece",
    textAlign: "left"
  },
});