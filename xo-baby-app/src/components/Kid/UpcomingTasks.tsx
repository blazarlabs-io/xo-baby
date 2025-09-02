import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../types/navigation';
import { getTasks, Task as ApiTask } from '@/api/taskApi';
import { useUserStore } from '@/store/userStore';

interface Task {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  time: string;
}

interface UpcomingTasksProps {
  tasks?: Task[];
  kidID: string;
}

const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ kidID }) => {

  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  // Get user from store instead of token
  const user = useUserStore((state) => state.user);
  const uid = user?.uid;

  // Debug: Log user store state
  useEffect(() => {
    console.log('🔍 UpcomingTasks: User store state:', user);
    console.log('🔍 UpcomingTasks: User UID:', uid);
  }, [user, uid]);

  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<ApiTask[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      if (!uid) {
        console.log('❌ UpcomingTasks: No user UID available');
        return;
      }

      setLoading(true);
      try {
        // Get more tasks to filter for upcoming ones
        const fetched = await getTasks(kidID, 10, uid);
        console.log('📋 UpcomingTasks: Fetched tasks:', fetched);

        // Filter for upcoming tasks (today and future dates)
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        console.log('📋 UpcomingTasks: Today is:', todayString);

        const upcomingTasks = fetched.filter(task => {
          const taskDate = new Date(task.date);
          const todayDate = new Date(todayString);
          const isUpcoming = taskDate >= todayDate;
          console.log(`📋 Task ${task.name} on ${task.date}: isUpcoming=${isUpcoming}`);
          return isUpcoming;
        });

        console.log('📋 UpcomingTasks: Upcoming tasks:', upcomingTasks);

        // Sort by date (earliest first) and take first 2
        const sortedTasks = upcomingTasks
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 2);

        console.log('📋 UpcomingTasks: Final sorted tasks to display:', sortedTasks);
        setTasks(sortedTasks);
      } catch (err) {
        console.error('❌ UpcomingTasks: Error loading tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    console.log('🔄 UpcomingTasks: Loading tasks for kid:', kidID, 'user:', uid);
    loadTasks();
  }, [uid, kidID]);

  const goDetail = () => {
    navigation.navigate('Tasks', { kidId: kidID });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Upcoming Tasks</Text>
        <Text style={styles.seeAll} onPress={goDetail}>See All</Text>
      </View>
      {loading ? (
        <ActivityIndicator />
      ) : tasks.length === 0 ? (
        <View>
          <Text>No tasks yet</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <View style={styles.cardLeftBorder} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                  <Pressable>
                    <Text style={styles.details}>Details</Text>
                  </Pressable>
                </View>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>{item.date}</Text>
                  <View style={styles.timeRow}>
                    <Image source={require('../../../assets/home-parent/clock.png')} alt=" pencil" width={10} height={10} />
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  cardWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  cardLeftBorder: {
    width: 6,
    backgroundColor: '#31CECE',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between'
  },
  cardHeader: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    display: 'flex',
    gap: 4
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left"
  },
  description: {
    width: "100%",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    textAlign: "left"
  },
  details: {
    fontSize: 12,
    textDecorationLine: "underline",
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#31cece",
    textAlign: "left",
    marginVertical: 4
  },
  dateBox: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: "solid",
    borderColor: "#dce3e3",
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    color: "#31cece",
    textAlign: "left"
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4
  },
  timeText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    textAlign: "left"
  },
});

export default UpcomingTasks;
