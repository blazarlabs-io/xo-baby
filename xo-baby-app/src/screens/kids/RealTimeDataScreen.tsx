import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../types/navigation';
import { useKidStore } from '../../store/kidStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import VitalStatsDisplay from '../../components/Kid/VitalStatsDisplay';
import HeartAndTempStats from '../../components/Kid/HeartTempStats';

type RealTimeDataProp = RouteProp<AppStackParamList, 'RealTimeData'>;

export default function RealTimeDataScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'RealTimeData'>>();
  const route = useRoute<RealTimeDataProp>();
  const { kidId } = route.params;

  const kid = useKidStore((state) =>
    state.kids.find((k) => k.id === kidId)
  );
  console.log('store Kid:', kid, 'params Kid:', kidId);


  if (!kid) return <Text>Kid not found</Text>;

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={{width: '100%', flex: 1}}>
    <View style={styles.container}>
      <View style={styles.componentHeaderContainer}>
        <Image
          source={require('../../../assets/kids/chevrons-left-right.png')}
          style={{ width: 24, height: 24 }} />
        <Text style={styles.realTimeText}>Real-time Data</Text>
      </View>

      <View style={styles.kidCard}>
				<View style={styles.avatarWrapper}>
					<View style={styles.avatarBorder}>
						<Image
							source={require('../../../assets/kids/avatar-girl.png')}
							style={styles.avatarImage}
						/>
					</View>
				</View>
				<View style={styles.kidInfoContainer}>
					<Text style={styles.kidName}>{kid.firstName} {kid.lastName}</Text>
					<Text style={styles.kidAge}>1 Months</Text>
				</View>
				<View style={styles.statusContainer}>
					<View style={styles.statusDot} />
					<Text style={styles.statusText}>Online</Text>
				</View>
			</View>

			<View style={styles.deviceCard}>
				<Text style={styles.deviceLabel}>Device</Text>
				<View style={styles.deviceRow}>
					<Image
						source={require('../../../assets/home-parent/bl-device.png')} 
						style={styles.deviceIcon}
					/>
					<Text style={styles.deviceName}>Mi Pulse Monitor S1</Text>
				</View>
			</View>

			<VitalStatsDisplay />
			<HeartAndTempStats />

      <View style={{ position: 'relative', width: '92%'}}>
        
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
     
    </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  componentHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 4
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  realTimeText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left"
  },
  kidCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 24,
  },
  avatarWrapper: {
    width: 47,
    height: 47,
    borderRadius: 47,
    backgroundColor: '#31CECE',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarBorder: {
    width: 38,
    height: 38,
    borderRadius: 38,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 38
  },
  kidInfoContainer: {
    marginLeft: 8,
    flex: 1
  },
  kidName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222128'
  },
  kidAge: {
    fontSize: 14,
    color: '#888'
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6EFF4F',
    marginRight: 4
  },
  statusText: {
    fontSize: 14,
    color: '#999'
  },
	deviceCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  deviceLabel: {
    flex: 1,
		fontSize: 12,
		lineHeight: 20,
		fontFamily: "Poppins-Regular",
		color: "#8d8d8d",
		textAlign: "left"
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 12,
    height: 16,
    marginRight: 4,
    resizeMode: 'contain',
  },
  deviceName: {
    fontSize: 14,
		lineHeight: 24,
		fontWeight: "500",
		fontFamily: "Poppins-Medium",
		color: "#222128",
		textAlign: "left"
  },
  backText: { textAlign: 'center', marginTop: 10, color: '#999' },
});
