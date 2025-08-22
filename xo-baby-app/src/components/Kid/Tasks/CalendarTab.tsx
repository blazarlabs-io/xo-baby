import React, { useState, useEffect } from 'react';
import { styles } from './TaskTabs.styles';
import { View, Text, Image, Pressable, Modal, KeyboardAvoidingView, TextInput, Platform, ActivityIndicator } from 'react-native';
import { useUserStore } from '@/store/userStore';
import { createTask, getTasks, Task as ApiTask } from '@/api/taskApi';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';

interface TodayTabProps {
  kidId: string;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const CalendarTab = ({ kidId, modalVisible, setModalVisible }: TodayTabProps) => {
  // Get user from store instead of token
  const user = useUserStore((state) => state.user);
  const uid = user?.uid;

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const todayString = today.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayString);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      if (!uid) return;
      setLoading(true);
      try {
        const fetched = await getTasks(kidId, 50, uid); // Get more tasks to cover all dates
        setTasks(fetched);
      } catch (err) {
        console.error('Error loading tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [uid, kidId]);

  // Function to handle date selection
  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString);
    console.log('📅 Selected date:', dateString);
  };

  // Filter tasks for the selected date
  const tasksForDate = tasks.filter((task) => task.date === selectedDate);

  const handleAddTask = async () => {
    console.log('🔄 Starting task creation...', { newDate, newTime, newName, kidId });

    if (!newDate || !newTime || !newName) {
      console.error('❌ Missing required fields:', { newDate, newTime, newName });
      alert('Please fill in all required fields (Date, Time, Name)');
      return;
    }

    if (!uid) {
      console.error('❌ No authentication token available');
      alert('Authentication required. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const payload = { date: newDate, time: newTime, name: newName, description: newDescription, kidId };
      console.log('📤 Sending task creation request:', payload);

      const created = await createTask(payload, uid);
      console.log('✅ Task created successfully:', created);

      setTasks((prev) => [created, ...prev]);
      setModalVisible(false);
      setNewDate('');
      setNewTime('');
      setNewName('');
      setNewDescription('');

      alert('Task created successfully!');
    } catch (error) {
      console.error('❌ Failed to create task:', error);
      alert(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const headerLabel = new Date(selectedDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  });

  return (
    <View style={styles.container}>
      <View style={{ paddingVertical: 8, gap: 10 }}>
        <Text style={styles.day}>{monthDay}</Text>
        <View>
          <CalendarProvider date={selectedDate}>
            <WeekCalendar
              firstDay={7}
              onDayPress={({ dateString }) => handleDateSelect(dateString)}
              theme={{
                calendarBackground: 'transparent',
                // optional: customize selected day color
                todayTextColor: '#00796b',
                dayTextColor: '#004d40'
              }}
            />
          </CalendarProvider>
        </View>
      </View>
      <View style={{ gap: 16, marginTop: 16 }}>
        {loading ? (
          <ActivityIndicator />
        ) : tasksForDate.map((task) => (
          <View key={task.id} style={styles.itemContainer}>
            <View>
              <Text style={styles.itemTitle}>{task.name}</Text>
              <Text style={styles.itemDescription}>{task.description}</Text>
              <Pressable>
                <Text style={styles.itemDetailBtn}>Details</Text>
              </Pressable>
            </View>
            <View style={styles.itemTimeContainer}>
              <Text style={styles.itemTime}>{task.time}</Text>
            </View>
          </View>
        ))}
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
              <Image source={require('../../../../assets/common/x.png')} style={{ width: 24, height: 24 }} />
            </Pressable>
            <View style={{ gap: 8, flexDirection: 'row' }}>
              <Image source={require('../../../../assets/home-parent/calendar.png')} width={24} height={24} />
              <Text>New Tasks</Text>
            </View>
            <Text style={styles.modalTitle}>Date</Text>
            <TextInput
              placeholder="2025-06-25"
              style={styles.modalInput}
              value={newDate}
              onChangeText={setNewDate}
            />
            <Text style={styles.modalTitle}>Time</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                placeholder="08:00"
                style={styles.modalInput}
                value={newTime}
                onChangeText={setNewTime}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.modalTitle}>Name</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                placeholder="Task name"
                style={styles.modalInput}
                value={newName}
                onChangeText={setNewName}
              />
            </View>
            <Text style={styles.modalTitle}>Description</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                placeholder="Description"
                style={styles.modalInput}
                value={newDescription}
                onChangeText={setNewDescription}
              />
            </View>
            <View style={styles.modalButtonRow}>
              <Pressable onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.buttonTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddTask} style={styles.addButton}>
                {loading ? <ActivityIndicator /> : <Text style={styles.buttonTextAdd}>Add</Text>}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};



export default CalendarTab;