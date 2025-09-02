import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image, Modal, KeyboardAvoidingView, TextInput, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../types/navigation';

import { useUserStore } from '@/store/userStore';
import { getNotes, updateNote, Note as NoteApi } from '@/api/notesApi';

interface NotesProps {
  kidID: string;
}

const Notes: React.FC<NotesProps> = (props) => {
  const { kidID } = props;
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  // Get user from store instead of token
  const user = useUserStore((state) => state.user)
  const uid = user?.uid

  // state
  const [notes, setNotes] = useState<NoteApi[]>([])
  const [loading, setLoading] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteApi | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState<string>('Health & Wellness')
  const [editDate, setEditDate] = useState('')
  const [editLoading, setEditLoading] = useState(false)



  // Fetch notes on mount or when uid/kidId changes
  useEffect(() => {
    const loadNotes = async () => {
      if (!uid) {
        return;
      }
      setLoading(true);
      try {
        const kidId = kidID;
        const fetched = await getNotes(uid, { kidId });
        setNotes(fetched);
      } catch (err) {
        console.error('Error loading notes:', err);
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [uid, kidID]);

  const goDetail = () => {
    navigation.navigate('Notes', { kidId: kidID });
  };

  // Function to get background color for note cards to match design
  const getNoteCardColor = (index: number) => {
    const colors = ['#FFC8F0', '#C8F0FF']; // Pink and light blue as shown in design
    return colors[index % colors.length];
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Function to open edit modal
  const openEditModal = (note: NoteApi) => {
    setEditingNote(note);
    setEditDescription(note.description);
    setEditCategory(note.category);
    setEditDate(note.date);
    setEditModalVisible(true);
  };

  // Function to close edit modal
  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingNote(null);
    setEditDescription('');
    setEditCategory('');
    setEditDate('');
  };

  // Function to save edited note
  const saveEditedNote = async () => {
    if (!editingNote || !uid || !editDescription.trim() || !editCategory || !editDate) {
      return;
    }

    setEditLoading(true);
    try {
      const updatedNote = await updateNote(uid, editingNote.id, {
        description: editDescription.trim(),
        category: editCategory as any,
        date: editDate,
      });

      // Update the notes array with the edited note
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === editingNote.id ? updatedNote : note
        )
      );

      closeEditModal();
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Notes</Text>
        <Pressable onPress={goDetail}>
          <Text style={styles.seeAll}>See All {'>'}</Text>
        </Pressable>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Loading notes...</Text>
        </View>
      ) : notes.length === 0 ? (
        <FlatList
          data={[
            { id: 'placeholder-1', description: 'Lorem ipsum dolor sit amet, consectetur adi piscing elit, sed do mod tempor labor...', date: 'May 3, 2023' },
            { id: 'placeholder-2', description: 'Lorem ipsum dolor sit amet, consetur adi piscing elit, sed do mod tempor labor asetum ...', date: 'May 3, 2023' }
          ]}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={[styles.noteCard, { backgroundColor: getNoteCardColor(index) }]}>
              {index === 0 && (
                <Pressable style={styles.favoriteIcon}>
                  <Text style={styles.starIcon}>★</Text>
                </Pressable>
              )}
              <Text style={styles.noteText} numberOfLines={5}>{item.description}</Text>
              <Text style={styles.noteDate}>{item.date}</Text>
              <Pressable style={styles.editIcon} onPress={() => alert('Create a real note to edit!')}>
                <Image
                  source={require('../../../assets/home-parent/pencil.png')}
                  style={styles.editIconImage}
                />
              </Pressable>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={notes.slice(0, 3)} // Show only first 3 notes in dashboard
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={[styles.noteCard, { backgroundColor: getNoteCardColor(index) }]}>
              {/* Star icon for important notes - you can add isFavorite logic later */}
              {/* {index === 0 && (
                <Pressable style={styles.favoriteIcon}>
                  <Text style={styles.starIcon}>★</Text>
                </Pressable>
              )} */}
              <Text style={styles.noteText} numberOfLines={5}>
                {item.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...'}
              </Text>
              <Text style={styles.noteDate}>{formatDate(item.date)}</Text>
              <Pressable style={styles.editIcon} onPress={() => openEditModal(item)}>
                <Image
                  source={require('../../../assets/home-parent/pencil.png')}
                  style={styles.editIconImage}
                />
              </Pressable>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          showsHorizontalScrollIndicator={false}
        />
      )}

      {/* Edit Note Modal */}
      <Modal
        transparent
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Pressable
              style={styles.modalClose}
              onPress={closeEditModal}
            >
              <Image
                source={require('../../../assets/common/x.png')}
                style={{ width: 24, height: 24 }}
              />
            </Pressable>

            <View style={{ gap: 8, flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../../../assets/home-parent/notebook-pen.png')}
                style={{ width: 20, height: 20 }}
              />
              <Text style={styles.modalTitle}>Edit Note</Text>
            </View>

            <Text style={styles.modalLabel}>Date</Text>
            <TextInput
              placeholder="2025-08-22"
              style={styles.modalInput}
              value={editDate}
              onChangeText={setEditDate}
            />

            <Text style={styles.modalLabel}>Category</Text>
            <View style={styles.categoryContainer}>
              {['Health & Wellness', 'Feeding', 'Sleep', 'Milestones', 'Diaper & Potty', 'Emotions & Behavior'].map((category) => (
                <Pressable
                  key={category}
                  style={[
                    styles.categoryButton,
                    editCategory === category && styles.categoryButtonActive
                  ]}
                  onPress={() => setEditCategory(category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    editCategory === category && styles.categoryButtonTextActive
                  ]}>
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              placeholder="Note description..."
              style={[styles.modalInput, styles.modalTextArea]}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtonRow}>
              <Pressable
                onPress={closeEditModal}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonTextCancel}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={saveEditedNote}
                style={styles.saveButton}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonTextSave}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    fontSize: 20,
    lineHeight: 24,
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
    textAlign: "right"
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#8d8d8d',
    fontFamily: 'Poppins-Regular',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8d8d8d',
    fontFamily: 'Poppins-Regular',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#b0b0b0',
    fontFamily: 'Poppins-Regular',
  },
  noteCard: {
    width: 140,
    height: 140,
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    justifyContent: 'space-between',
    borderStyle: "solid",
    borderColor: "#dce3e3",
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noteText: {
    color: '#222128',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    fontStyle: 'normal',
    lineHeight: 16,
    marginTop: 8,
  },
  noteDate: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    textAlign: "left",
    marginTop: 8,
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
  starIcon: {
    color: '#FF8B00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#222128',
    borderRadius: 16,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconImage: {
    width: 12,
    height: 12,
    tintColor: '#fff',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 32,
    paddingHorizontal: 32,
    paddingTop: 44,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222128',
    fontFamily: 'Poppins-Medium',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222128',
    fontFamily: 'Poppins-Medium',
    marginTop: 20,
    marginBottom: 8,
  },
  modalInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#dce3e3',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dce3e3',
    backgroundColor: '#fff',
  },
  categoryButtonActive: {
    backgroundColor: '#31CECE',
    borderColor: '#31CECE',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#222128',
    fontFamily: 'Poppins-Regular',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#dce3e3',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#31CECE',
    alignItems: 'center',
  },
  buttonTextCancel: {
    fontSize: 16,
    color: '#222128',
    fontFamily: 'Poppins-Medium',
  },
  buttonTextSave: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Medium',
  },
});

export default Notes;
