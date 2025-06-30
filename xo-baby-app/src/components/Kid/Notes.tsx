import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../types/navigation';

import { useUserStore } from '@/store/userStore';
import { getNotes, Note as NoteApi  } from '@/api/notesApi';

interface Note {
  id: string;
  text: string;
  date: string;
  color: string;
  isFavorite?: boolean;
}

interface NotesProps {
  notes: Note[];
  kidID: string;
}

const Notes: React.FC<NotesProps> = (props) => {
  const { kidID } = props;
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'KidProfile'>>();

  // retrieve token from user store
  const user = useUserStore((state) => state.user)
  const token = user?.token

  // state
  const [notes, setNotes] = useState<NoteApi[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch notes on mount or when token/kidId changes
  useEffect(() => {
    const loadNotes = async () => {
      if (!token) return
      setLoading(true)
      try {
        const kidId = kidID
        const fetched = await getNotes(token, { kidId })
        setNotes(fetched)
      } catch (err) {
        console.error('Error loading notes:', err)
      } finally {
        setLoading(false)
      }
    }
    loadNotes()
  }, [token, kidID])

  const goDetail = () => {
    navigation.navigate('Notes', { kidId: kidID });
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Notes</Text>
        <Text style={styles.seeAll} onPress={goDetail}>See All</Text>
      </View>
      { loading ? (
        <ActivityIndicator />
      ) : notes.length === 0 ? ( 
        <View>
          <Text>No notes yet</Text>
        </View>
       ) : (
      <FlatList
        data={notes}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.noteCard, { backgroundColor: '#FFC8F0' }]}>
            {/* <TouchableOpacity style={styles.favoriteIcon}>
              {item.isFavorite && (
                <MaterialCommunityIcons name="star" size={16} color="#FF8B00" />
              )}
            </TouchableOpacity> */}
            <Text style={styles.noteText} numberOfLines={5}>{item.description}</Text>
            <Text style={styles.noteDate}>{item.date}</Text>
            <TouchableOpacity style={styles.editIcon}>
              <Image source={require('../../../assets/home-parent/pencil.png')} alt=" pencil" width={10} height={10} />
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        showsHorizontalScrollIndicator={false}
      />
      )}
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
    width: 117,
    height: 131,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    justifyContent: 'space-between',
    marginTop: 12,
    borderStyle: "solid",
    borderColor: "#dce3e3",
    borderWidth: 1,
  },
  noteText: {
    color: ' #222128',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    fontStyle: 'normal',
  },
  noteDate: {
    width: "100%",
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    textAlign: "left"
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
    backgroundColor: '#222128',
    borderRadius: 16,
    width: 24,
    height: 24,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Notes;
