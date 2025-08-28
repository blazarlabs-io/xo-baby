import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, Dimensions, Image, Pressable, Modal, KeyboardAvoidingView, TextInput, Platform, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { styles } from './WeightChartCard.styles';

import { getHeightRecords, createHeightRecord, CreateMeasurementRecordPayload, MeasurementRecord } from '@/api/measurementsApi';
import { useUserStore } from '@/store/userStore';

const chartHeight = 195;

const rangeOptions: Record<RangeKey, { label: string; months: number }> = {
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

  // token validation temporarily disabled for development
  // const user = useUserStore((state) => state.user)
  // const token = user?.token

  const [modalVisible, setModalVisible] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [selectedRange, setSelectedRange] = useState<RangeKey>('3m');
  const [loading, setLoading] = useState(false)
  const [heightRecords, setHeightRecords] = useState<MeasurementRecord[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const now = new Date();
  const monthsBack = rangeOptions[selectedRange].months;
  const fromDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);

  // Function to fetch height records
  const loadHeightRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const kidId = kidID
      const fetched = await getHeightRecords(kidId)
      setHeightRecords(fetched)
    } catch (err: any) {
      console.error('Error loading Height:', err)
      setError(err?.message || 'Failed to load height data')
      // Set empty array to prevent crashes
      setHeightRecords([])
    } finally {
      setLoading(false)
    }
  }, [kidID])

  // Function to refresh data (for manual refresh)
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadHeightRecords()
    } finally {
      setRefreshing(false)
    }
  }, [loadHeightRecords])

  // Fetch Height Records on mount and when kidID changes
  useEffect(() => {
    loadHeightRecords()
  }, [loadHeightRecords])

  // Set up periodic refresh every 30 seconds to keep data live
  useEffect(() => {
    const interval = setInterval(() => {
      loadHeightRecords()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [loadHeightRecords])

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

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (heightRecords.length < 2) return 0;

    const sortedRecords = [...heightRecords].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Get current month's records
    const currentMonthRecords = sortedRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    // Get previous month's records
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthRecords = sortedRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === prevMonth && recordDate.getFullYear() === prevYear;
    });

    if (currentMonthRecords.length === 0 || prevMonthRecords.length === 0) return 0;

    const currentAvg = currentMonthRecords.reduce((sum, record) => sum + record.value, 0) / currentMonthRecords.length;
    const prevAvg = prevMonthRecords.reduce((sum, record) => sum + record.value, 0) / prevMonthRecords.length;

    if (prevAvg === 0) return 0;
    return ((currentAvg - prevAvg) / prevAvg) * 100;
  }, [heightRecords]);

  const labels = [];
  const dataset = [];
  const progressDataset = []; // For expected growth line

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

    // Calculate expected growth line (simple linear progression)
    if (i === 0) {
      // Use first actual data point or start with a reasonable base value
      const firstActualValue = dataset[0] || 50; // Default starting height
      progressDataset.push(firstActualValue);
    } else {
      const expectedGrowth = 2.0; // Expected monthly growth in cm
      const prevValue: number = progressDataset[i - 1];
      progressDataset.push(Math.max(0, prevValue + expectedGrowth));
    }
  }

  const chartData = {
    labels,
    datasets: [
      {
        data: dataset,
        color: () => '#FAAD37',
        strokeWidth: 3,
        legend: 'Actual Height'
      },
      {
        data: progressDataset,
        color: () => '#E3E3E3',
        strokeWidth: 2,
        legend: 'Expected Growth'
      }
    ],
    legend: ['Actual Height', 'Expected Growth']
  };

  // Handle creating a new height record
  const handleAddRecord = async () => {
    if (!newDate.trim() || !newHeight.trim()) return;
    setLoading(true);
    try {
      const payload: CreateMeasurementRecordPayload = {
        date: newDate,
        value: parseFloat(newHeight),
      };

      // Call backend to create and return the new record
      const created: MeasurementRecord = await createHeightRecord(kidID, payload);

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
          <View style={[styles.icon1, { backgroundColor: '#FAAD37' }]}>
            <Image source={require('../../../assets/development/ruler.png')} width={10} height={10} />
          </View>
          <Text style={styles.header}>Height</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Refresh Button */}
          <Pressable onPress={handleRefresh} disabled={refreshing}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              opacity: refreshing ? 0.6 : 1
            }}>
              <Image
                source={require('../../../assets/development/chart-line.png')}
                width={16}
                height={16}
                style={{
                  transform: [{ rotate: refreshing ? '180deg' : '0deg' }]
                }}
              />
              <Text style={[styles.subHeader, { fontSize: 12 }]}>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </View>
          </Pressable>

          {/* Range Selector */}
          <Pressable onPress={() => {
            setSelectedRange(prev => prev === '3m' ? '6m' : prev === '6m' ? '9m' : '3m');
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <Text style={styles.subHeader}>{rangeOptions[selectedRange].label}</Text>
              <Image source={require('../../../assets/development/chevron-down.png')} width={16} height={16} />
            </View>
          </Pressable>
        </View>
      </View>

      <View style={[styles.chartContainer, { backgroundColor: '#FFF2DF' }]}>
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
        <Text style={styles.progressText}>
          {progressPercentage > 0
            ? `Height increase of ${progressPercentage.toFixed(1)}% this month`
            : progressPercentage < 0
              ? `Height decrease of ${Math.abs(progressPercentage).toFixed(1)}% this month`
              : 'No height change this month'
          }
        </Text>
        <Text style={styles.progressNote}>Showing <Text style={styles.progressHighlight}>actual measurements</Text> and <Text style={styles.progressHighlight}>expected growth</Text>.</Text>

        {/* Error Display */}
        {error && (
          <View style={{
            backgroundColor: '#FFE5E5',
            padding: 12,
            borderRadius: 8,
            marginVertical: 8,
            borderWidth: 1,
            borderColor: '#FFCCCC'
          }}>
            <Text style={{ color: '#D32F2F', fontSize: 12, textAlign: 'center' }}>
              ⚠️ {error}
            </Text>
          </View>
        )}

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