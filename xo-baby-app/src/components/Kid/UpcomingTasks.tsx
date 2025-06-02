import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Task {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  time: string;
}

interface UpcomingTasksProps {
  tasks: Task[];
}

const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ tasks }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Upcoming Tasks</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <View style={styles.cardLeftBorder} />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>{item.dateLabel}</Text>
                  <View style={styles.timeRow}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.description}>{item.description}</Text>
              <TouchableOpacity>
                <Text style={styles.details}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  description: {
    color: '#999',
    marginTop: 4,
    fontSize: 13,
  },
  details: {
    color: '#00BFCB',
    marginTop: 8,
    fontSize: 13,
  },
  dateBox: {
    backgroundColor: '#F7F7F7',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: {
    color: '#00BFCB',
    fontWeight: '600',
    fontSize: 13,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default UpcomingTasks;
