import React, { useState, useMemo } from 'react';
import { View, Text, Dimensions, Image, TouchableOpacity, Modal, KeyboardAvoidingView, TextInput, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { styles } from './WeightChartCard.styles';

const chartHeight = 195;

const rangeOptions: Record <RangeKey, { label: string; months: number }> = {
  '3m': { label: 'Last 3 months', months: 3 },
  '6m': { label: 'Last 6 months', months: 6 },
  '9m': { label: 'Last 9 months', months: 9 },
};

type RangeKey = '3m' | '6m' | '9m';

type WeightRecord = {
  date: string;
  value: number;
};

type HeightChartCardProps = {
  kidID: string;
}

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getMonthYearString(date: Date) {
  return `${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
}

export default function HeightChartCard({ kidID }: HeightChartCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [selectedRange, setSelectedRange] = useState<RangeKey>('3m');
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([
  { date: '2025-04-01', value: 4.2 },
  { date: '2025-05-01', value: 5.0 },
  { date: '2025-06-01', value: 5.5 },
])

  const now = new Date();
  const monthsBack = rangeOptions[selectedRange].months;
  const fromDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);

  const filtered = useMemo(() => {
    const byMonth = new Map();
    weightRecords.forEach((record) => {
      const date = new Date(record.date);
      if (date >= fromDate && date <= now) {
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!byMonth.has(key)) {
          byMonth.set(key, []);
        }
        byMonth.get(key).push(record.value);
      }
    });
    return byMonth;
  }, [weightRecords, selectedRange]);

  const labels = [];
  const dataset = [];
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1 + i, 1);
    const label = monthLabels[d.getMonth()];
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    labels.push(label);
    if (filtered.has(key)) {
      const values = filtered.get(key);
      const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
      dataset.push(Number(avg.toFixed(2)));
    } else {
      dataset.push(0);
    }
  }

  const chartData = {
    labels,
    datasets: [
      { data: dataset, color: () => '#31CECE', strokeWidth: 3 },
    ],
    legend: ['Progress']
  };

  const handleAddRecord = () => {
    if (newDate.trim() !== '' && newWeight.trim() !== '') {
      const parsedDate = new Date(newDate);
      if (!isNaN(parsedDate.getTime())) {
        setWeightRecords(prev => [...prev, {
          date: parsedDate.toISOString(),
          value: parseFloat(newWeight)
        }]);
        setNewDate('');
        setNewWeight('');
        setModalVisible(false);
      }
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.icon1}>
            <Image source={require('../../../assets/development/weight.png')} width={10} height={10} />
          </View>
          <Text style={styles.header}>Weight</Text>
        </View>
        <TouchableOpacity onPress={() => {
          setSelectedRange(prev => prev === '3m' ? '6m' : prev === '6m' ? '9m' : '3m');
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <Text style={styles.subHeader}>{rangeOptions[selectedRange].label}</Text>
            <Image source={require('../../../assets/development/chevron-down.png')} width={16} height={16} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.name}>Camila Doe</Text>
        <Text style={styles.dateRange}>{getMonthYearString(fromDate)} - {getMonthYearString(now)}</Text>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 64}
          height={chartHeight}
          withDots={true}
          withShadow={false}
          withInnerLines={true}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            labelColor: () => '#A0A0A0',
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#31CECE'
            },
            propsForBackgroundLines: {
              stroke: '#E3E3E3'
            },
            decimalPlaces: 1,
          }}
          bezier
          style={styles.chart}
        />
        <Text style={styles.progressText}>Weight chart over time</Text>
        <Text style={styles.progressNote}>Showing <Text style={styles.progressHighlight}>average per month</Text>.</Text>
        <TouchableOpacity style={styles.buttonAdd} onPress={() => setModalVisible(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={require('../../../assets/development/chart-line.png')} style={{ width: 20, height: 20 }} />
            <Text style={styles.addNewRecordText}>New Record</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Image source={require('../../../assets/common/x.png')} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
            <View style={{ gap: 8, flexDirection: 'row' }}>
              <Image source={require('../../../assets/development/chart-line.png')} width={24} height={24} />
              <Text>New Record</Text>
            </View>
            <Text style={styles.modalTitle}>Date</Text>
            <TextInput
              placeholder="2024-06-01"
              style={styles.modalInput}
              value={newDate}
              onChangeText={setNewDate}
            />
            <Text style={styles.modalTitle}>Weight</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                placeholder="4.12"
                style={styles.modalInput}
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
              />
              <Text style={styles.valueUnitText}>Kg</Text>
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.buttonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddRecord} style={styles.addButton}>
                <Text style={styles.buttonTextAdd}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}