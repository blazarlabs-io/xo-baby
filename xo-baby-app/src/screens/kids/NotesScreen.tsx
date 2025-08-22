import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../types/navigation';
import { useKidStore } from '../../store/kidStore';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';

import NotesContent from '@/components/Kid/Notes/NotesContent';
import { CreateNotePayload } from '@/api/notesApi'

type NotesProp = RouteProp<AppStackParamList, 'Notes'>;

const categories: CreateNotePayload['category'][] = [
  'all',
  'Health & Wellness',
  'Feeding',
  'Sleep',
  'Milestones',
  'Diaper & Potty',
  'Emotions & Behavior',
];


export default function NotesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'Notes'>>();
  const route = useRoute<NotesProp>();
  const { kidId } = route.params;

  // Toggle state
  const [selectedCategory, setSelectedCategory] = useState<CreateNotePayload['category']>('all');
  const selectCategory = (category: CreateNotePayload['category']) => setSelectedCategory(category);
  const [modalVisible, setModalVisible] = useState(false);

  const kid = useKidStore((state) =>
    state.kids.find((k) => k.id === kidId)
  );

  if (!kid) return <Text>Kid not found</Text>;

  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={{ width: '100%', flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.componentHeaderContainer}>
          <Image
            source={require('../../../assets/home-parent/notebook-pen.png')}
            style={{ width: 20, height: 20 }} />
          <Text style={styles.realTimeText}>Notes</Text>
        </View>
        <View style={styles.kidCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorder}>
              <Image
                source={require('../../../assets/kids/avatar-girl.png')}
                style={styles.avatarImage}
              />
            </View>
          </View>
          <View style={styles.kidInfoContainer}>
            <Text style={styles.kidName}>{kid.firstName} {kid.lastName}</Text>
            <Text style={styles.kidAge}>8 Months</Text>
          </View>

        </View>
        <View style={{ width: '100%', marginTop: 32 }}>
          <View style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => selectCategory(itemValue as CreateNotePayload['category'])}
              style={styles.dropdown}
            >
              {categories.map((category) => (
                <Picker.Item label={category} value={category} key={category} />
              ))}
            </Picker>
            <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Image
                source={require('../../../assets/home-parent/add.png')}
                style={{ width: 14, height: 14 }}
              />
            </Pressable>
          </View>
        </View>

        <NotesContent
          kidId={kidId}
          setModalVisible={setModalVisible}
          modalVisible={modalVisible}
          selectedCategory={selectedCategory}
        />

        <View style={{ position: 'relative', width: '92%', marginTop: 50 }}>

          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  componentHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 4
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  realTimeText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left"
  },
  kidCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 8,
    width: '100%',
    elevation: 2,
    marginTop: 24,
  },
  avatarWrapper: {
    width: 47,
    height: 47,
    borderRadius: 47,
    backgroundColor: '#31CECE',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarBorder: {
    width: 38,
    height: 38,
    borderRadius: 38,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 38
  },
  kidInfoContainer: {
    marginLeft: 8,
    flex: 1
  },
  kidName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222128'
  },
  kidAge: {
    fontSize: 14,
    color: '#888'
  },
  tabButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 32,
    borderStyle: "solid",
    borderColor: "#8d8d8d",
    borderWidth: 1,
  },
  activeTabButton: {
    backgroundColor: '#31cece',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 32,
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    textAlign: "left"
  },
  addButton: {
    padding: 12,
    borderRadius: 32,
    justifyContent: "center",
    backgroundColor: "#31cece"
  },
  dropdown: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
    color: "#222128",
    textAlign: "left",
    backgroundColor: 'transparent',
    borderWidth: 0
  },

  backText: { textAlign: 'center', marginTop: 10, color: '#999' },
});

