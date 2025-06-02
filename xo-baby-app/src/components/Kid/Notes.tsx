import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Note {
  id: string;
  text: string;
  date: string;
  color: string;
  isFavorite?: boolean;
}

interface NotesProps {
  notes: Note[];
}

const Notes: React.FC<NotesProps> = ({ notes }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Notes</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>
      <FlatList
        data={notes}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.noteCard, { backgroundColor: item.color }]}>
            <TouchableOpacity style={styles.favoriteIcon}>
              {item.isFavorite && (
                <MaterialCommunityIcons name="star" size={16} color="#FF8B00" />
              )}
            </TouchableOpacity>
            <Text style={styles.noteText} numberOfLines={5}>{item.text}</Text>
            <Text style={styles.noteDate}>{item.date}</Text>
            <TouchableOpacity style={styles.editIcon}>
              <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    width: '100%',
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
  noteCard: {
    width: 157,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#555',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Notes;
