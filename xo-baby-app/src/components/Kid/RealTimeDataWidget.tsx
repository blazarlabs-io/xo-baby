import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../types/navigation';
import { useKidStore } from '../../store/kidStore';
import { medicalDataService, RealTimeMedicalData } from '../../services/medicalDataService';

interface RealTimeDataProps {
  heartRate?: number;
  temperature?: number;
  respiration?: number;
  oxygen?: number;
  deviceName?: string;
  kidID: string;
}

const RealTimeDataWidget: React.FC<RealTimeDataProps> = ({
  heartRate,
  temperature,
  respiration,
  oxygen,
  deviceName,
  kidID
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [currentData, setCurrentData] = useState<RealTimeMedicalData | null>(null);
  const [historicalData, setHistoricalData] = useState<RealTimeMedicalData | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);

  // Function to fetch historical data when not collecting
  const fetchHistoricalData = async () => {
    if (!kidID) return;

    try {
      console.log("📊 Widget: Fetching historical data for kid:", kidID);

      // Try to get average historical data first, fallback to latest
      let data = await medicalDataService.getAverageHistoricalData(kidID);
      if (!data) {
        data = await medicalDataService.getLatestHistoricalData(kidID);
      }

      if (data) {
        setHistoricalData(data);
        console.log("✅ Widget: Historical data loaded:", data);
      } else {
        console.log("📊 Widget: No historical data available");
        setHistoricalData(null);
      }
    } catch (error) {
      console.error('❌ Widget: Error fetching historical data:', error);
      setHistoricalData(null);
    }
  };

  // Check collection status and get current data
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await medicalDataService.getCollectionStatus();
        setIsCollecting(status.isCollecting);

        if (status.isCollecting) {
          const latestData = medicalDataService.getCurrentData();
          setCurrentData(latestData);
        } else {
          // If not collecting, fetch historical data
          await fetchHistoricalData();
        }
      } catch (error) {
        console.error('❌ Error checking collection status:', error);
      }
    };

    checkStatus();

    // Update data periodically if collecting
    const interval = setInterval(() => {
      if (isCollecting) {
        const latestData = medicalDataService.getCurrentData();
        setCurrentData(latestData);
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isCollecting, kidID]);

  const goDetail = () => {
    navigation.navigate('RealTimeData', { kidId: kidID });
  }

  const formatValue = (value?: number | string) =>
    value !== undefined && value !== null && value !== '' ? value : '-';

  // Use real-time data if available, otherwise use historical data, then props
  const displayHeartRate = currentData?.heartRate || historicalData?.heartRate || heartRate;
  const displayTemperature = currentData?.temperature || historicalData?.temperature || temperature;
  const displayRespiration = currentData?.breathingRate || historicalData?.breathingRate || respiration;
  const displayOxygen = currentData?.oximetry || historicalData?.oximetry || oxygen;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerText}>Real-time Data</Text>
          {isCollecting && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        <Text style={styles.seeAll} onPress={goDetail}>See All</Text>
      </View>
      <View style={styles.dataContainer}>
        <View style={styles.dataItem}>
          <Image
            source={require('../../../assets/home-parent/heart.png')} width={16} height={16} />
          <Text style={styles.dataText}>{formatValue(displayHeartRate)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.dataItem}>
          <Image
            source={require('../../../assets/home-parent/thermometer.png')} width={16} height={16} />
          <Text style={styles.dataText}>{formatValue(displayTemperature)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.dataItem}>
          <Image
            source={require('../../../assets/home-parent/lungs.png')} width={16} height={16} />
          <Text style={styles.dataText}>{formatValue(displayRespiration)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.dataItem}>
          <Image
            source={require('../../../assets/home-parent/O2.png')} width={20} height={27} />
          <Text style={styles.dataText}>{displayOxygen !== undefined ? `${displayOxygen}%` : '-'}</Text>
        </View>
      </View>
      <View style={styles.deviceNameContainer}>
        <Image
          source={require('../../../assets/home-parent/bl-device.png')} width={12} height={16} />
        <Text style={styles.deviceName}>
          {isCollecting
            ? 'Medical Sensor (Simulated)'
            : historicalData
              ? (new Date(historicalData.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
                ? 'Last recorded data'
                : 'Demo data (No recent records)')
              : deviceName || 'No device connected'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E9F8F8',
    borderRadius: 16,
    elevation: 2,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerText: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left"
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#8d8d8d",
    textAlign: "left"
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DCE3E3',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 12
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  dataText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left",
    marginLeft: 6,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#ccc',
  },
  deviceNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  deviceName: {
    marginLeft: 4,
    color: '#999',
    fontSize: 13,
  },
});

export default RealTimeDataWidget;
