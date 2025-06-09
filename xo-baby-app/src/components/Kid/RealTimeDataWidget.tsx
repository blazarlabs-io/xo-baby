import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../types/navigation';
import { useKidStore } from '../../store/kidStore';

interface RealTimeDataProps {
  heartRate: number;
  temperature: number;
  respiration: number;
  oxygen: number;
  deviceName: string;
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
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'KidProfile'>>();

  const goDetail = () => {
    navigation.navigate('RealTimeData', { kidId: kidID }); 
  }

  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Real-time Data</Text>
        <Text style={styles.seeAll} onPress={goDetail}>See All</Text>
      </View>
      <View style={styles.dataContainer}>
        <View style={styles.dataItem}>
          <Image
            source={require('../../../assets/home-parent/heart.png')} width={16} height={16} />
          <Text style={styles.dataText}>{heartRate}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.dataItem}>
          <Image
            source={require('../../../assets/home-parent/thermometer.png')} width={16} height={16} />
          <Text style={styles.dataText}>{temperature}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.dataItem}>
          <Image
            source={require('../../../assets/home-parent/lungs.png')} width={16} height={16} />
          <Text style={styles.dataText}>{respiration}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.dataItem}>
          <Image
            source={require('../../../assets/home-parent/O2.png')} width={20} height={27} />
          <Text style={styles.dataText}>{oxygen}%</Text>
        </View>
      </View>
      <View style={styles.deviceNameContainer}>
        <Image
          source={require('../../../assets/home-parent/bl-device.png')} width={12} height={16} />
        <Text style={styles.deviceName}>{deviceName}</Text>
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
  headerText: {
    flex: 1,
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left"
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
