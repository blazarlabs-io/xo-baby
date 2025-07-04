import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Dimensions, Image, Pressable, Modal, KeyboardAvoidingView, TextInput, Platform, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { styles } from './WeightChartCard.styles';

import { getHeightRecords, createHeightRecord, CreateMeasurementRecordPayload, MeasurementRecord } from '@/api/measurementsApi';
import { useUserStore } from '@/store/userStore';

const chartHeight = 195;

const rangeOptions: Record <RangeKey, { label: string; months: number }> = {
  '3m': { label: 'Last 3 months', months: 3 },
  '6m': { label: 'Last 6 months', months: 6 },
  '9m': { label: 'Last 9 months', months: 9 },
};

type RangeKey = '3m' | '6m' | '9m';

type HeightChartCardProps = {
  kidID: string;
}

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getMonthYearString(date: Date) {
  return `${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
}

export default function HeightChartCard({ kidID }: HeightChartCardProps) {

  // retrieve token from user store
  const user = useUserStore((state) => state.user)
  const token = user?.token

  const [modalVisible, setModalVisible] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [selectedRange, setSelectedRange] = useState<RangeKey>('3m');
  const [loading, setLoading] = useState(false)
  const [heightRecords, setHeightRecords] = useState<MeasurementRecord[]>([])

  const now = new Date();
  const monthsBack = rangeOptions[selectedRange].months;
  const fromDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);

  // Fetch Weight Records 
    useEffect(() => {
      const loadWeight = async () => {
        if (!token) return
        setLoading(true)
        try {
          const kidId = kidID
          const fetched = await getHeightRecords(token, kidId )
          setHeightRecords(fetched)
        } catch (err) {
          console.error('Error loading Height:', err)
        } finally {
          setLoading(false)
        }
      }
      loadWeight()
    }, [token, kidID])

  const filtered = useMemo(() => {
    const byMonth = new Map();
    heightRecords.forEach((record) => {
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
  }, [heightRecords, selectedRange]);

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
      { data: dataset, color: () => '#FAAD37', strokeWidth: 3 },
    ],
    legend: ['Progress']
  };

  // Handle creating a new weight record
  const handleAddRecord = async () => {
    if (!newDate.trim() || !newHeight.trim() || !token) return;
    setLoading(true);
    try {
      const payload: CreateMeasurementRecordPayload = {
        date: newDate,
        value: parseFloat(newHeight),
      };

      // Call backend to create and return the new record
      const created: MeasurementRecord = await createHeightRecord(token, kidID, payload);

      // Prepend to local state
      setHeightRecords(prev => [created, ...prev]);

      // Reset form and close modal
      setModalVisible(false);
      setNewDate('');
      setNewHeight('');
    } catch (error) {
      console.error('Failed to create height record', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.icon1, {backgroundColor: '#FAAD37'}]}>
            <Image source={require('../../../assets/development/ruler.png')} width={10} height={10} />
          </View>
          <Text style={styles.header}>Height</Text>
        </View>
        <Pressable onPress={() => {
          setSelectedRange(prev => prev === '3m' ? '6m' : prev === '6m' ? '9m' : '3m');
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <Text style={styles.subHeader}>{rangeOptions[selectedRange].label}</Text>
            <Image source={require('../../../assets/development/chevron-down.png')} width={16} height={16} />
          </View>
        </Pressable>
      </View>

      <View style={[styles.chartContainer, {backgroundColor: '#FFF2DF'}]}>
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
              stroke: '#FAAD37'
            },
            propsForBackgroundLines: {
              stroke: '#E3E3E3'
            },
            decimalPlaces: 1,
          }}
          bezier
          style={styles.chart}
        />
        <Text style={styles.progressText}>Height chart over time</Text>
        <Text style={styles.progressNote}>Showing <Text style={styles.progressHighlight}>average per month</Text>.</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#31CECE" />
        ) : (
        <Pressable style={styles.buttonAdd} onPress={() => setModalVisible(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={require('../../../assets/development/chart-line.png')} style={{ width: 20, height: 20 }} />
            <Text style={styles.addNewRecordText}>New Record</Text>
          </View>
        </Pressable>
        )}
      </View>

      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Image source={require('../../../assets/common/x.png')} style={{ width: 24, height: 24 }} />
            </Pressable>
            <View style={{ gap: 8, flexDirection: 'row' }}>
              <Image source={require('../../../assets/development/chart-line.png')} width={24} height={24} />
              <Text>New Record</Text>
            </View>
            <Text style={styles.modalTitle}>Date</Text>
            <TextInput
              placeholder="2025-06-01"
              style={styles.modalInput}
              value={newDate}
              onChangeText={setNewDate}
            />
            <Text style={styles.modalTitle}>Height</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                placeholder="4.12"
                style={styles.modalInput}
                value={newHeight}
                onChangeText={setNewHeight}
                keyboardType="decimal-pad"
              />
              <Text style={styles.valueUnitText}>cm</Text>
            </View>
            <View style={styles.modalButtonRow}>
              <Pressable onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.buttonTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddRecord} style={styles.addButton}>
                <Text style={styles.buttonTextAdd}>Add</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}