import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../store/userStore';
import AuthService from '../../../services/authService';
import { auth } from '../../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignupCheckEmailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'SignupCheckEmailScreen'>>();
  const { user } = useUserStore();
  const [seconds, setSeconds] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [statusMessage, setStatusMessage] = useState('📧 Verification email has been sent to your inbox');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'checking' | 'verified' | 'not_verified'>('pending');
  const [emailSentStatus, setEmailSentStatus] = useState<'sent' | 'not_sent' | 'unknown'>('sent'); // Assume sent initially

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-check verification status every 30 seconds
  useEffect(() => {
    const autoCheckInterval = setInterval(async () => {
      if (!isCheckingVerification && verificationStatus !== 'verified') {
        try {
          const isVerified = await AuthService.checkEmailVerificationStatus();
          if (isVerified) {
            setVerificationStatus('verified');
            setStatusMessage('✅ Email verified automatically!');
            // Show success message briefly before auto-redirect
            setTimeout(() => {
              setStatusMessage('🎉 Redirecting to sign-in...');
              // Auto-redirect after 3 seconds
              setTimeout(() => {
                AuthService.signOut().then(() => {
                  navigation.navigate('LoginEmail' as any);
                });
              }, 1000);
            }, 2000);
          }
        } catch (error) {
          // Silently fail for auto-checks
          console.log('Auto verification check failed:', error);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(autoCheckInterval);
  }, [isCheckingVerification, verificationStatus]);

  // Listen for auth state changes to detect email verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        console.log('🎉 Email verified! User can proceed');
        setVerificationStatus('verified');
        setStatusMessage('✅ Email verified successfully!');
        // Update user store with verified status
        // The RootNavigator will automatically redirect to the main app
      } else if (firebaseUser && !firebaseUser.emailVerified) {
        setVerificationStatus('not_verified');
        setStatusMessage('📧 Waiting for email verification...');
      }
    });

    return unsubscribe;
  }, []);

  const handleNext = async () => {
    setIsCheckingVerification(true);
    setVerificationStatus('checking');
    setStatusMessage('🔄 Checking email verification status...');

    try {
      // Show step-by-step progress
      setStatusMessage('📧 Connecting to verification service...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for user feedback

      setStatusMessage('🔍 Checking your email verification...');
      const isVerified = await AuthService.checkEmailVerificationStatus();

      if (isVerified) {
        console.log('✅ Email verified, proceeding to main app');
        setVerificationStatus('verified');
        setStatusMessage('✅ Email verified successfully!');

        Alert.alert(
          'Email Verified!',
          'Your email has been verified successfully. You can now access all features of the app.',
          [{
            text: 'Get Started',
            onPress: () => {
              console.log('Navigating to main app...');
              // The RootNavigator will handle the navigation automatically
            }
          }]
        );
      } else {
        setVerificationStatus('not_verified');
        setStatusMessage('❌ Email not verified yet');

        Alert.alert(
          'Email Not Verified',
          'Please check your email and click the verification link before continuing. If you haven\'t received the email, try resending it.',
          [{
            text: 'OK',
            onPress: () => {
              setStatusMessage('📧 Waiting for email verification...');
            }
          }]
        );
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
      setVerificationStatus('not_verified');
      setStatusMessage('⚠️ Error checking verification status');

      Alert.alert(
        'Connection Error',
        'Unable to check email verification status. Please check your internet connection and try again.',
        [{
          text: 'OK',
          onPress: () => {
            setStatusMessage('📧 Waiting for email verification...');
          }
        }]
      );
    } finally {
      setIsCheckingVerification(false);
    }
  };

  const handleResendEmail = async () => {
    if (seconds > 0) return;

    setIsResending(true);
    setEmailSentStatus('not_sent');
    setStatusMessage('📤 Sending verification email...');

    try {
      await AuthService.resendEmailVerification();
      setSeconds(30);
      setEmailSentStatus('sent');
      setStatusMessage('✅ Verification email sent successfully!');

      Alert.alert(
        'Email Sent!',
        'Verification email has been sent to your inbox. Please check your email (including spam folder) and click the verification link.',
        [{
          text: 'OK',
          onPress: () => {
            setStatusMessage('📧 Waiting for email verification...');
          }
        }]
      );
    } catch (error: any) {
      console.error('Failed to resend verification email:', error);
      setEmailSentStatus('not_sent');
      setStatusMessage('❌ Failed to send verification email');

      Alert.alert(
        'Send Failed',
        error.message || 'Failed to send verification email. Please try again.',
        [{
          text: 'OK',
          onPress: () => {
            setStatusMessage('⚠️ Email send failed - try again');
          }
        }]
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    Alert.alert(
      'Go Back to Login?',
      'Are you sure you want to go back to the login screen? You can always sign up again later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go Back',
          style: 'destructive',
          onPress: () => {
            // Sign out and go back to welcome screen
            AuthService.signOut().then(() => {
              navigation.navigate('Welcome' as any);
            });
          }
        }
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#E2F3F3', '#E2FFFF']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Verify Account</Text>

        {/* Envelope Illustration */}
        <View style={styles.illustrationContainer}>
          {verificationStatus === 'verified' ? (
            // Open envelope with OK
            <View style={styles.envelopeOpen}>
              <View style={styles.envelopeBody}>
                <View style={styles.envelopeFlap} />
                <View style={styles.envelopeContent}>
                  <Text style={styles.okText}>OK</Text>
                </View>
              </View>
            </View>
          ) : (
            // Closed envelope with wings
            <View style={styles.envelopeClosed}>
              <View style={styles.envelopeBody}>
                <View style={styles.envelopeFlap} />
                <View style={styles.wingLeft} />
                <View style={styles.wingRight} />
              </View>
            </View>
          )}
        </View>

        {/* Main Content */}
        {verificationStatus === 'verified' ? (
          // Success State
          <View style={styles.textContainer}>
            <Text style={styles.mainTitle}>Email confirmed</Text>
            <Text style={styles.subtitle}>
              Please continue and enjoy all the features of your new XO account.
            </Text>
          </View>
        ) : (
          // Verification State
          <View style={styles.textContainer}>
            <Text style={styles.mainTitle}>Check your email inbox</Text>
            <Text style={styles.subtitle}>
              We've sent you an email. Please check your inbox and follow instructions to verify your account.
            </Text>

            {/* Email Display */}
            <View style={styles.emailContainer}>
              <Text style={styles.emailLabel}>Email sent to:</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {verificationStatus === 'verified' ? (
          // Success State - Next Button
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => {
              // Sign out and redirect to sign-in
              AuthService.signOut().then(() => {
                navigation.navigate('LoginEmail' as any);
              });
            }}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          // Verification State - Resend and Check buttons
          <View style={styles.actionContainer}>
            {/* Resend Email Section */}
            <View style={styles.resendSection}>
              <Text style={styles.resendQuestion}>Didn't receive an email?</Text>
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendEmail}
                disabled={seconds > 0 || isResending}
              >
                <Text style={[
                  styles.resendButtonText,
                  (seconds > 0 || isResending) && styles.resendButtonTextDisabled
                ]}>
                  {isResending ? 'Sending...' : 'Resend Email'}
                </Text>
              </TouchableOpacity>
              {seconds > 0 && (
                <Text style={styles.countdownText}>in {seconds} seconds</Text>
              )}
            </View>

            {/* Check Verification Button */}
            <TouchableOpacity
              style={[
                styles.checkButton,
                isCheckingVerification && styles.buttonDisabled
              ]}
              onPress={handleNext}
              disabled={isCheckingVerification}
            >
              {isCheckingVerification ? (
                <View style={styles.buttonLoadingContainer}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={[styles.checkButtonText, styles.loadingText]}>
                    Checking...
                  </Text>
                </View>
              ) : (
                <Text style={styles.checkButtonText}>Check Verification</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Back to Login Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToLogin}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#31CECE',
    marginBottom: 24,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#31CECE',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#31CECE',
  },
  secondaryButtonText: {
    color: '#31CECE',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  textDisabled: {
    opacity: 0.6,
  },
  // New Design Styles
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  illustrationContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  envelopeOpen: {
    width: 120,
    height: 80,
    position: 'relative',
  },
  envelopeClosed: {
    width: 120,
    height: 80,
    position: 'relative',
  },
  envelopeBody: {
    width: 120,
    height: 80,
    backgroundColor: '#31CECE',
    borderRadius: 8,
    position: 'relative',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  envelopeFlap: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#31CECE',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    transform: [{ rotate: '180deg' }],
  },
  envelopeContent: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  okText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  wingLeft: {
    position: 'absolute',
    left: -15,
    top: 20,
    width: 20,
    height: 15,
    backgroundColor: '#31CECE',
    borderRadius: 10,
    transform: [{ rotate: '-15deg' }],
  },
  wingRight: {
    position: 'absolute',
    right: -15,
    top: 20,
    width: 20,
    height: 15,
    backgroundColor: '#31CECE',
    borderRadius: 10,
    transform: [{ rotate: '15deg' }],
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  emailContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },

  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendQuestion: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    color: '#31CECE',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    opacity: 0.6,
  },
  countdownText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  checkButton: {
    backgroundColor: '#31CECE',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  checkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#31CECE',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 30,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: 'white',
  },
  // Status Message Styles
  statusContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
  },
  statusSuccess: {
    backgroundColor: '#D4EDDA',
    borderColor: '#C3E6CB',
  },
  statusChecking: {
    backgroundColor: '#D1ECF1',
    borderColor: '#BEE5EB',
  },
  statusError: {
    backgroundColor: '#F8D7DA',
    borderColor: '#F5C6CB',
  },
  statusText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    fontWeight: '500',
  },
  statusTextSuccess: {
    color: '#155724',
  },
  statusTextChecking: {
    color: '#0C5460',
  },
  statusTextError: {
    color: '#721C24',
  },
  statusLoader: {
    marginLeft: 8,
  },
  // Email Status Styles
  emailStatusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minWidth: 280,
  },
  emailStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emailStatusLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  emailStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  emailStatusSent: {
    backgroundColor: '#D4EDDA',
    borderColor: '#C3E6CB',
  },
  emailStatusNotSent: {
    backgroundColor: '#F8D7DA',
    borderColor: '#F5C6CB',
  },
  verificationStatusVerified: {
    backgroundColor: '#D4EDDA',
    borderColor: '#C3E6CB',
  },
  verificationStatusNotVerified: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
  },
  verificationStatusChecking: {
    backgroundColor: '#D1ECF1',
    borderColor: '#BEE5EB',
  },
  emailStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },

  // Success State Styles
  successContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4EDDA',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    minWidth: 300,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D4EDDA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: '#31CECE',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
