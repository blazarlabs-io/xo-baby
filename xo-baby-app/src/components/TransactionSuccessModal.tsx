import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';

interface TransactionSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  transactionHash: string;
  kidName: string;
}

export default function TransactionSuccessModal({ 
  visible, 
  onClose, 
  transactionHash, 
  kidName 
}: TransactionSuccessModalProps) {
  
  const copyToClipboard = async () => {
    if (!transactionHash || transactionHash === 'Transaction hash not available') {
      Alert.alert(
        'Not Available', 
        'Transaction hash is not available to copy',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      await Clipboard.setStringAsync(transactionHash);
      Alert.alert(
        'Copied!', 
        'Transaction hash copied to clipboard',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error', 
        'Failed to copy transaction hash',
        [{ text: 'OK' }]
      );
    }
  };

  const truncateHash = (hash: string) => {
    if (hash.length <= 20) return hash;
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#E2F3F3', '#E2FFFF']}
            style={styles.gradient}
          >
            <View style={styles.content}>
              {/* Success Icon */}
              <View style={styles.successIcon}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              
              {/* Title */}
              <Text style={styles.title}>Kid Created Successfully!</Text>
              
              {/* Kid Name */}
              <Text style={styles.kidName}>{kidName}</Text>
              
              {/* Subtitle */}
              <Text style={styles.subtitle}>
                Your kid has been securely stored on the Midnight blockchain
              </Text>
              
              {/* Transaction Hash Section */}
              <View style={styles.hashSection}>
                <Text style={styles.hashLabel}>Transaction Hash:</Text>
                <View style={styles.hashContainer}>
                  <Text style={styles.hashText}>
                    {transactionHash ? truncateHash(transactionHash) : 'Not available'}
                  </Text>
                  <Pressable 
                    style={[
                      styles.copyButton,
                      (!transactionHash || transactionHash === 'Transaction hash not available') && styles.copyButtonDisabled
                    ]} 
                    onPress={copyToClipboard}
                    disabled={!transactionHash || transactionHash === 'Transaction hash not available'}
                  >
                    <Text style={[
                      styles.copyButtonText,
                      (!transactionHash || transactionHash === 'Transaction hash not available') && styles.copyButtonTextDisabled
                    ]}>Copy</Text>
                  </Pressable>
                </View>
                <Text style={styles.fullHash}>
                  {transactionHash || 'Transaction hash not available'}
                </Text>
              </View>
              
              {/* Info Text */}
              <Text style={styles.infoText}>
                This transaction hash proves your kid's data is securely stored on the blockchain. 
                You can use it to verify the transaction anytime.
              </Text>
              
              {/* Continue Button */}
              <Pressable style={styles.continueButton} onPress={onClose}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  gradient: {
    padding: 30,
  },
  content: {
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  kidName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#31CECE',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  hashSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  hashLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  hashText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: '#31CECE',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  copyButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  copyButtonTextDisabled: {
    color: '#999',
  },
  fullHash: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  continueButton: {
    backgroundColor: '#31CECE',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 