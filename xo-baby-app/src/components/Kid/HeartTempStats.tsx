import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';

export default function HeartAndTempStats() {
  const screenWidth = Dimensions.get('window').width;
  const temperature = 36.1;
  const heartRate = 125;

  const data = {
    labels: [],
    datasets: [
      {
        data: [120, 130, 125, 135, 128, 125, 130, 125, 130, 125, 135, 128, 125, 130, ],
        color: () => '#31CECE',
        strokeWidth: 2
      }
    ]
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <LineChart
          data={data}
          width={119}
          height={40}
          withHorizontalLabels={false}
          withVerticalLabels={false}
          withDots={false}
          withShadow={false}
          withInnerLines={false}
          withOuterLines={false}
          chartConfig={{
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            color: () => '#31CECE',
						propsForBackgroundLines: {
							strokeWidth: 0
						}
          }}
          style={styles.graph}
        />
        <View style={styles.valueRow}>
          <Image source={require('../../../assets/home-parent/heart-large.png')} style={styles.icon} />
          <Text style={styles.valueText}>{heartRate}</Text>
          <Text style={styles.unitText}>BPM</Text>
        </View>
      </View>

      <View style={styles.card}>
        <LinearGradient
          colors={['#26E2FF', '#FBF073', '#FA63FD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />
        <View style={styles.valueRow}>
          <Image source={require('../../../assets/home-parent/thermometer-large.png')} style={styles.icon} />
          <Text style={styles.valueText}>{temperature}</Text>
          <Text style={styles.unitText}>℃</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
		width: '100%',
    gap: 16
  },
  card: {
    minWidth: 119,
    minHeight: 83,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  gradientBar: {
    width: 119,
    height: 35,
    borderRadius: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
		marginTop: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
  valueText: {
    fontSize: 24,
    letterSpacing: 0.5,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#222128',
  },
  unitText: {
    fontSize: 12,
    letterSpacing: 0.2,
    fontFamily: 'Poppins-Regular',
    color: '#8d8d8d',
    marginLeft: 4,
  },
  graph: {
    marginBottom: 8,
  	paddingRight: 0
  },
});
