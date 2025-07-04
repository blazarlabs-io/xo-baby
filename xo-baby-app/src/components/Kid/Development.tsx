import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../types/navigation';
import { LineChart } from 'react-native-chart-kit';

export interface DevelopmentItem {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  color: string;
  icon: ReturnType<typeof require>;
  chartData: number[];
  chartColor: string;
}

interface DevelopmentProps {
  lastUpdated: string;
  kidID: string;
  data: DevelopmentItem[];
}

const Development: React.FC<DevelopmentProps> = (props) => {

  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'KidProfile'>>();
  const { lastUpdated, kidID, data } = props;
 
  const goDetail = () => {
    navigation.navigate('Development', { kidId: kidID }); 
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Development</Text>
        <Text style={styles.seeAll} onPress={goDetail}>See All</Text>
      </View>
      <View style={styles.cardRow}>
        {data.map((item) => (
          <View key={item.id} style={[styles.card, {backgroundColor: '#FFF'}]}>
            <View style={styles.cardHeader}>
              <Image
            		source={item.icon} width={16} height={16} /> 
              <Text style={styles.label}>{item.label}</Text>
            </View>
            <LineChart
              data={{
                labels: item.chartData.map(() => ""),
                datasets: [
                  {
                    data: item.chartData,
                    color: () => item.chartColor,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={90}
              height={40}
              withDots={false}
              withShadow={false}
              withInnerLines={false}
              withOuterLines={false}
              withHorizontalLabels={false}
              withVerticalLabels={false}
              chartConfig={{
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                color: () => item.chartColor,
              }}
              style={{ 
                marginVertical: 4, 
                borderRadius: 12, 
                backgroundColor: item.color, 
                height: 62,
                paddingRight: 0,
                paddingLeft: 0,
              } }
            />
            <Text style={styles.value}>{item.value} <Text style={styles.unit}>{item.unit}</Text></Text>
          </View>
        ))}
      </View>
      <Text style={styles.updatedText}>Last updated {lastUpdated ? lastUpdated : '- -'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    borderRadius: 16,
    width: '100%',
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  cardRow: {
    flexDirection: 'row',
    gap: 8,
		marginTop: 12
  },
  card: {
    borderRadius: 12,
    padding: 4,
    width: 100,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
		letterSpacing: 0.2,
		fontWeight: "500",
		fontFamily: "Poppins-Medium",
		color: "#222128",
		textAlign: "left",
		marginLeft: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
		position: 'absolute',
		bottom: 10,
		right: 18,
  },
  unit: {
    fontSize: 12,
    color: '#555',
  },
  updatedText: {
    fontSize: 12,
		lineHeight: 20,
		fontFamily: "Poppins-Regular",
		color: "#8d8d8d",
		textAlign: "left",
		marginTop: 8,
  },
});

export default Development;