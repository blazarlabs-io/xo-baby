import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated
} from 'react-native';
import { medicalDataService, RealTimeMedicalData } from '../../services/medicalDataService';

interface RealTimeDataProps {
  kidId: string;
}

const RealTimeData: React.FC<RealTimeDataProps> = ({ kidId }) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [currentData, setCurrentData] = useState<RealTimeMedicalData | null>(null);
  const [historicalData, setHistoricalData] = useState<RealTimeMedicalData | null>(null);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [collectionStatus, setCollectionStatus] = useState({
    isCollecting: false,
    kidId: '',
    startTime: '',
    currentBufferSize: 0,
  } as {
    isCollecting: boolean;
    kidId?: string;
    startTime?: string;
    currentBufferSize?: number;
  });

  // Animated values for pulse effect
  const heartPulse = new Animated.Value(1);
  const dataPulse = new Animated.Value(1);

  // Check initial collection status and fetch historical data if needed
  useEffect(() => {
    console.log("🔍 RealTimeData component mounted, kidId:", kidId);
    checkCollectionStatus();

    // If not collecting, try to fetch historical data
    if (!isCollecting && kidId) {
      fetchHistoricalData();
    }
  }, [kidId, isCollecting]);

  // Update current data periodically when collecting
  useEffect(() => {
    let dataInterval: NodeJS.Timeout | null = null;

    if (isCollecting) {
      dataInterval = setInterval(() => {
        const latestData = medicalDataService.getCurrentData();
        setCurrentData(latestData);

        // Trigger pulse animation when new data comes in
        if (latestData) {
          triggerDataPulse();
        }
      }, 2000); // Update UI every 2 seconds
    }

    return () => {
      if (dataInterval) {
        clearInterval(dataInterval);
      }
    };
  }, [isCollecting]);

  // Heart pulse animation
  useEffect(() => {
    if (currentData?.heartRate) {
      const bpm = currentData.heartRate;
      const intervalMs = (60 / bpm) * 1000; // Convert BPM to milliseconds

      const pulse = () => {
        Animated.sequence([
          Animated.timing(heartPulse, {
            toValue: 1.3,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(heartPulse, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      };

      const heartInterval = setInterval(pulse, intervalMs);
      return () => clearInterval(heartInterval);
    }
  }, [currentData?.heartRate]);

  const triggerDataPulse = () => {
    Animated.sequence([
      Animated.timing(dataPulse, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(dataPulse, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchHistoricalData = async () => {
    if (!kidId) return;

    try {
      setIsLoadingHistorical(true);
      console.log("📊 Fetching historical data for kid:", kidId);

      // Try to get average historical data first, fallback to latest
      let data = await medicalDataService.getAverageHistoricalData(kidId);
      if (!data) {
        data = await medicalDataService.getLatestHistoricalData(kidId);
      }

      if (data) {
        setHistoricalData(data);
        console.log("✅ Historical data loaded:", data);
      } else {
        console.log("📊 No historical data available");
        setHistoricalData(null);
      }
    } catch (error) {
      console.error('❌ Error fetching historical data:', error);
      setHistoricalData(null);
    } finally {
      setIsLoadingHistorical(false);
    }
  };

  const checkCollectionStatus = async () => {
    try {
      console.log("🔍 Checking collection status...");
      const status = await medicalDataService.getCollectionStatus();
      console.log("📊 Collection status:", status);

      setCollectionStatus(status);
      setIsCollecting(status.isCollecting);

      if (status.isCollecting) {
        console.log('🩺 Found existing collection session');
      } else {
        console.log('🛑 No active collection session');
      }
    } catch (error) {
      console.error('❌ Error checking collection status:', error);
      // Set default status on error
      setCollectionStatus({
        isCollecting: false,
        kidId: '',
        startTime: '',
        currentBufferSize: 0,
      });
      setIsCollecting(false);
    }
  };

  const handleStartCollection = async () => {
    console.log("🔐 Starting collection for kid:", kidId);

    // Add immediate visual feedback
    setIsCollecting(true);

    try {
      // Start collection immediately without confirmation for now
      await medicalDataService.startDataCollection(kidId);
      console.log("✅ Collection started successfully");

      // Update status
      await checkCollectionStatus();

      // Show success message
      Alert.alert(
        "Success!",
        "Medical data collection has started. Data will be collected every second and uploaded every 10 minutes.",
        [{ text: "OK" }]
      );

    } catch (error) {
      console.error('❌ Error starting collection:', error);

      // Reset state on error
      setIsCollecting(false);

      // Show error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Error',
        `Failed to start data collection: ${errorMessage}`,
        [{ text: "OK" }]
      );
    }
  };

  const handleStopCollection = async () => {
    console.log("🛑 Stopping collection for kid:", kidId);

    try {
      // Stop collection immediately
      await medicalDataService.stopDataCollection();
      console.log("✅ Collection stopped successfully");

      // Reset state
      setIsCollecting(false);
      setCurrentData(null);

      // Update status
      await checkCollectionStatus();

      // Fetch historical data to show when stopped
      await fetchHistoricalData();

      // Show success message
      Alert.alert(
        "Stopped!",
        "Medical data collection has been stopped. Any remaining data will be uploaded.",
        [{ text: "OK" }]
      );

    } catch (error) {
      console.error('❌ Error stopping collection:', error);

      // Show error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Error',
        `Failed to stop data collection: ${errorMessage}`,
        [{ text: "OK" }]
      );
    }
  };

  const getVitalColor = (vital: string, value: number): string => {
    switch (vital) {
      case 'heartRate':
        if (value >= 100 && value <= 140) return '#4CAF50'; // Normal
        if (value >= 80 && value <= 160) return '#FF9800'; // Warning
        return '#F44336'; // Critical
      case 'oximetry':
        if (value >= 95) return '#4CAF50'; // Normal
        if (value >= 90) return '#FF9800'; // Warning
        return '#F44336'; // Critical
      case 'temperature':
        if (value >= 36.1 && value <= 37.8) return '#4CAF50'; // Normal
        if (value >= 35.5 && value <= 38.5) return '#FF9800'; // Warning
        return '#F44336'; // Critical
      default:
        return '#2196F3'; // Default blue
    }
  };

  const formatDuration = (startTime: string): string => {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const diffMs = now - start;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffSec = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${diffMin}:${diffSec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Real-time Data</Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isCollecting ? '#4CAF50' : '#9E9E9E' }
          ]} />
          <Text style={styles.statusText}>
            {isCollecting ? 'Collecting' : 'Stopped'}
          </Text>
        </View>
      </View>

      {isCollecting && collectionStatus.startTime && (
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            Duration: {formatDuration(collectionStatus.startTime)}
          </Text>
          <Text style={styles.infoText}>
            Buffer: {collectionStatus.currentBufferSize} points
          </Text>
        </View>
      )}

      {currentData ? (
        <Animated.View style={[styles.dataContainer, { transform: [{ scale: dataPulse }] }]}>
          <View style={styles.vitalsGrid}>
            <View style={[styles.vitalCard, styles.heartRateCard]}>
              <View style={styles.vitalHeader}>
                <Animated.Text style={[
                  styles.vitalIcon,
                  { transform: [{ scale: heartPulse }] }
                ]}>
                  ❤️
                </Animated.Text>
                <Text style={styles.vitalLabel}>Heart Rate</Text>
              </View>
              <Text style={[
                styles.vitalValue,
                { color: getVitalColor('heartRate', currentData.heartRate) }
              ]}>
                {currentData.heartRate}
              </Text>
              <Text style={styles.vitalUnit}>BPM</Text>
            </View>

            <View style={[styles.vitalCard, styles.oximetryCard]}>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalIcon}>🫁</Text>
                <Text style={styles.vitalLabel}>Oximetry</Text>
              </View>
              <Text style={[
                styles.vitalValue,
                { color: getVitalColor('oximetry', currentData.oximetry) }
              ]}>
                {currentData.oximetry}
              </Text>
              <Text style={styles.vitalUnit}>%</Text>
            </View>

            <View style={[styles.vitalCard, styles.temperatureCard]}>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalIcon}>🌡️</Text>
                <Text style={styles.vitalLabel}>Temperature</Text>
              </View>
              <Text style={[
                styles.vitalValue,
                { color: getVitalColor('temperature', currentData.temperature) }
              ]}>
                {currentData.temperature.toFixed(1)}
              </Text>
              <Text style={styles.vitalUnit}>°C</Text>
            </View>

            <View style={[styles.vitalCard, styles.breathingCard]}>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalIcon}>💨</Text>
                <Text style={styles.vitalLabel}>Breathing</Text>
              </View>
              <Text style={styles.vitalValue}>
                {currentData.breathingRate}
              </Text>
              <Text style={styles.vitalUnit}>per min</Text>
            </View>

            <View style={[styles.vitalCard, styles.movementCard]}>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalIcon}>🏃</Text>
                <Text style={styles.vitalLabel}>Movement</Text>
              </View>
              <Text style={styles.vitalValue}>
                {currentData.movement}
              </Text>
              <Text style={styles.vitalUnit}>intensity</Text>
            </View>

            <View style={[styles.vitalCard, styles.timestampCard]}>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalIcon}>⏰</Text>
                <Text style={styles.vitalLabel}>Last Update</Text>
              </View>
              <Text style={styles.timestampValue}>
                {new Date(currentData.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        </Animated.View>
      ) : isCollecting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#31CECE" />
          <Text style={styles.loadingText}>Waiting for sensor data...</Text>
        </View>
      ) : historicalData ? (
        <Animated.View style={[styles.dataContainer, { transform: [{ scale: dataPulse }] }]}>
          <View style={styles.historicalDataHeader}>
            <Text style={styles.historicalDataTitle}>
              {new Date(historicalData.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
                ? 'Last Known Values'
                : 'Demo Values (No recent data)'}
            </Text>
            <Text style={styles.historicalDataTimestamp}>
              {new Date(historicalData.timestamp).toLocaleString()}
            </Text>
          </View>
          <View style={styles.vitalsGrid}>
            <View style={[styles.vitalCard, styles.heartRateCard]}>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalIcon}>❤️</Text>
                <Text style={styles.vitalLabel}>Heart Rate</Text>
              </View>
              <Text style={[
                styles.vitalValue,
                { color: getVitalColor('heartRate', historicalData.heartRate) }
              ]}>
                {historicalData.heartRate}
              </Text>
              <Text style={styles.vitalUnit}>BPM</Text>
            </View>

            <View style={[styles.vitalCard, styles.oximetryCard]}>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalIcon}>🫁</Text>
                <Text style={styles.vitalLabel}>Oximetry</Text>
              </View>
              <Text style={[
                styles.vitalValue,
                { color: getVitalColor('oximetry', historicalData.oximetry) }
              ]}>
                {historicalData.oximetry}
              </Text>
              <Text style={styles.vitalUnit}>%</Text>
            </View>

            <View style={[styles.vitalCard, styles.temperatureCard]}>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalIcon}>🌡️</Text>
                <Text style={styles.vitalLabel}>Temperature</Text>
              </View>
              <Text style={[
                styles.vitalValue,
                { color: getVitalColor('temperature', historicalData.temperature) }
              ]}>
                {historicalData.temperature.toFixed(1)}
              </Text>
              <Text style={styles.vitalUnit}>°C</Text>
            </View>

            <View style={[styles.vitalCard, styles.breathingCard]}>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalIcon}>💨</Text>
                <Text style={styles.vitalLabel}>Breathing</Text>
              </View>
              <Text style={styles.vitalValue}>
                {historicalData.breathingRate}
              </Text>
              <Text style={styles.vitalUnit}>per min</Text>
            </View>

            <View style={[styles.vitalCard, styles.movementCard]}>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalIcon}>🏃</Text>
                <Text style={styles.vitalLabel}>Movement</Text>
              </View>
              <Text style={styles.vitalValue}>
                {historicalData.movement}
              </Text>
              <Text style={styles.vitalUnit}>intensity</Text>
            </View>

            <View style={[styles.vitalCard, styles.timestampCard]}>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalIcon}>⏰</Text>
                <Text style={styles.vitalLabel}>Last Update</Text>
              </View>
              <Text style={styles.timestampValue}>
                {new Date(historicalData.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        </Animated.View>
      ) : isLoadingHistorical ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#31CECE" />
          <Text style={styles.loadingText}>Loading historical data...</Text>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>📊</Text>
          <Text style={styles.placeholderText}>
            Start data collection to see real-time medical data
          </Text>
        </View>
      )}

      <View style={styles.controlsContainer}>
        {/* Debug info */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Kid ID: {kidId || 'None'}</Text>
          <Text style={styles.debugText}>Status: {isCollecting ? 'Collecting' : 'Stopped'}</Text>
          <Text style={styles.debugText}>Buffer: {collectionStatus.currentBufferSize || 0}</Text>
        </View>

        {!isCollecting ? (
          <Pressable
            style={styles.startButton}
            onPress={handleStartCollection}
            disabled={!kidId}
          >
            <Text style={styles.startButtonText}>
              {kidId ? 'Start Collection' : 'Loading...'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.stopButton}
            onPress={handleStopCollection}
          >
            <Text style={styles.stopButtonText}>Stop Collection</Text>
          </Pressable>
        )}

        {/* Refresh historical data button when not collecting */}
        {!isCollecting && (
          <Pressable
            style={styles.refreshButton}
            onPress={fetchHistoricalData}
            disabled={isLoadingHistorical}
          >
            <Text style={styles.refreshButtonText}>
              {isLoadingHistorical ? 'Refreshing...' : '🔄 Refresh Data'}
            </Text>
          </Pressable>
        )}

        {/* Test button for debugging */}
        <Pressable
          style={styles.testButton}
          onPress={() => {
            console.log("🧪 Test button pressed");
            Alert.alert("Test", "Button is working!");
          }}
        >
          <Text style={styles.testButtonText}>Test Alert</Text>
        </Pressable>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxText}>
          💡 Data is collected every second and automatically uploaded to IPFS every 10 minutes for secure storage.
          {!isCollecting && historicalData && (
            new Date(historicalData.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
              ? ' Historical data is shown when collection is stopped.'
              : ' Demo values are shown since no recent data is available. Start collecting to see real data.'
          )}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
  },
  dataContainer: {
    marginBottom: 20,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dce3e3',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  heartRateCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFCDD2',
  },
  oximetryCard: {
    backgroundColor: '#F3E5F5',
    borderColor: '#CE93D8',
  },
  temperatureCard: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD54F',
  },
  breathingCard: {
    backgroundColor: '#E8F5E8',
    borderColor: '#A5D6A7',
  },
  movementCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#90CAF9',
  },
  timestampCard: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  vitalIcon: {
    fontSize: 16,
  },
  vitalLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#222128",
  },
  vitalValue: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    fontWeight: 'bold',
    color: "#222128",
  },
  vitalUnit: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    marginTop: 2,
  },
  timestampValue: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#222128",
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#8d8d8d',
    fontFamily: 'Poppins-Regular',
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  placeholderIcon: {
    fontSize: 48,
  },
  placeholderText: {
    fontSize: 14,
    color: '#8d8d8d',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    maxWidth: 250,
  },
  controlsContainer: {
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#31CECE',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    fontWeight: '500',
  },
  stopButton: {
    backgroundColor: '#F44336',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  infoBoxText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#2E7D32',
    lineHeight: 16,
  },
  debugInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: '#FF9800',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  testButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    fontWeight: '500',
  },
  historicalDataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  historicalDataTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    fontStyle: 'italic',
  },
  historicalDataTimestamp: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#8d8d8d',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  refreshButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    fontWeight: '500',
  },
});

export default RealTimeData;
