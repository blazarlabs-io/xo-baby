import React, { useState, useEffect } from 'react'
import { styles } from './Content.styles'
import {
  View,
  Text,
  Image,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useUserStore } from '@/store/userStore'
import {
  getNotes,
  createNote,
  updateNote,
  Note,
  CreateNotePayload,
} from '@/api/notesApi'
import { Picker } from '@react-native-picker/picker'

interface NotesContentProps {
  kidId: string
  modalVisible: boolean
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  selectedCategory: string;
}

const NotesContent = ({ kidId, modalVisible, setModalVisible, selectedCategory }: NotesContentProps) => {

  const user = useUserStore((state) => state.user)
  const token = user?.token

  const [newDate, setNewDate] = useState('')
  const [newCategory, setNewCategory] = useState<CreateNotePayload['category'] | ''>('')
  const [newDescription, setNewDescription] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)

  // Filter notes based on selectedCategory
  const filteredNotes =
    selectedCategory === 'all'
      ? notes
      : notes.filter((note) => note.category === selectedCategory);


  // Fetch notes on mount or when token/kidId changes
  useEffect(() => {
    const loadNotes = async () => {
      if (!token) return
      setLoading(true)
      try {
        const fetched = await getNotes(token, { kidId })
        setNotes(fetched)
      } catch (err) {
        console.error('Error loading notes:', err)
      } finally {
        setLoading(false)
      }
    }
    loadNotes()
  }, [token, kidId])

  // Handle creating a new note
  const handleAddNote = async () => {
    if (!newDate || !newCategory || !newDescription || !token) return
    setLoading(true)
    try {
      const payload: CreateNotePayload = {
        date: newDate,
        category: newCategory,
        description: newDescription,
        kidId,
      }
      const created = await createNote(token, payload)
      setNotes((prev) => [created, ...prev])
      setModalVisible(false)
      setNewDate('')
      setNewCategory('')
      setNewDescription('')
    } catch (error) {
      console.error('Failed to create note', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>

      <View style={{ gap: 16, marginTop: 16 }}>
        {loading ? (
          <ActivityIndicator />
        ) : filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <View key={note.id} style={styles.itemContainer}>
              <View>
                <Text style={styles.itemTitle}>{note.category}</Text>
                <Text style={styles.itemDescription}>
                  {note.description}
                </Text>
                <Pressable>
                  <Text style={styles.itemDetailBtn}>Details</Text>
                </Pressable>
              </View>
              <View style={styles.itemTimeContainer}>
                <Text style={styles.itemTime}>{note.date}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text>No notes for this category.</Text>
        )}
      </View>

      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Pressable
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
            >
              <Image
                source={require('../../../../assets/common/x.png')}
                style={{ width: 24, height: 24 }}
              />
            </Pressable>

            <View style={{ gap: 8, flexDirection: 'row' }}>
              <Image
                source={require('../../../../assets/home-parent/calendar.png')}
                style={{ width: 24, height: 24 }}
              />
              <Text>New Note</Text>
            </View>

            <Text style={styles.modalTitle}>Date</Text>
            <TextInput
              placeholder="2025-06-25"
              style={styles.modalInput}
              value={newDate}
              onChangeText={setNewDate}
            />

            <Text style={styles.modalTitle}>Description</Text>
            <TextInput
              placeholder="Description"
              style={styles.modalInput}
              value={newDescription}
              onChangeText={setNewDescription}
            />

            <Text style={styles.modalTitle}>Category</Text>
            <Picker
              selectedValue={newCategory}
              // On Android use a native dialog so it appears above the Modal
              mode={Platform.OS === 'android' ? 'dialog' : undefined}
              // Keep it a fixed height; avoid flex:1 here
              style={{ height: 68, width: '100%' }}
              onValueChange={(value /*, index */) => setNewCategory(value)}
            >
              <Picker.Item label="Select category" value="" />
              <Picker.Item label="Health & Wellness" value="Health & Wellness" />
              <Picker.Item label="Feeding" value="Feeding" />
              <Picker.Item label="Sleep" value="Sleep" />
              <Picker.Item label="Milestones" value="Milestones" />
              <Picker.Item label="Diaper & Potty" value="Diaper & Potty" />
              <Picker.Item label="Emotions & Behavior" value="Emotions & Behavior" />
            </Picker>

            <View style={styles.modalButtonRow}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonTextCancel}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleAddNote}
                style={styles.addButton}
              >
                {loading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.buttonTextAdd}>Add Note</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

export default NotesContent
