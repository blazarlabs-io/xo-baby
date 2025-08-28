import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../types/navigation'; 
import { Calendar } from 'react-native-calendars';


export default function AddKidBirthdayScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'AddKidBirthday'>>();
  const route = useRoute<RouteProp<AppStackParamList, 'AddKidBirthday'>>();

  const [birthday, setBirthday] = useState('');
  const { firstName, lastName, gender } = route.params;

  const handleNext = () => {
   navigation.navigate('AddKidBloodType', { firstName, lastName, gender, birthday });

  };

  return (
     <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <View style={{ height: 24, flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Image source={require('../../../../assets/common/chevron-left.png')} width={24} height={24} />
        </Pressable>
        <View style={styles.headerText}><Text>Add Kid</Text></View>
      </View>
      <View style={{marginTop: 24, justifyContent: 'center', alignItems: 'center'}}>
        <View style={{ gap: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.progressPointActive} ></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPoint}></View>
          <View style={styles.progressPoint}></View>
          <View style={styles.progressPoint}></View>
          <View style={styles.progressPoint}></View>
          <View style={styles.progressPoint}></View>
        </View>
      </View>
      <View style={{ marginTop: 24, maxWidth: 172 }}>
        <Text style={styles.title}>Kid’s birth date</Text>
      </View>
      <View style={{ marginTop: 24 }}>
        <Calendar
          onDayPress={day => setBirthday(day.dateString)}
          markedDates={{
            [birthday]: { selected: true, selectedColor: '#31CECE' },
          }}
          style={{ borderRadius: 12 }}
          theme={{
            selectedDayBackgroundColor: '#31CECE',
            todayTextColor: '#31CECE',
            arrowColor: '#31CECE',
          }}
        />
      </View>

      <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' }}>
        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backBtn: { borderWidth: 1, borderColor: '#CACACA', width: 24,  height: 24, borderRadius: 4, cursor: 'pointer', position: 'absolute', left: 0,  alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1,  padding: 24,  },
  headerText: { fontSize: 16, fontWeight: 'bold', justifyContent: 'center', textAlign: 'center' },
  progressPointActive: { width: 12, height: 12, borderRadius: 50, backgroundColor: '#31CECE' },
  progressPoint: { width: 12, height: 12, borderRadius: 50, backgroundColor: '#CACACA' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 42, letterSpacing: 1.5, color: '#222128'},
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 0,
    borderRadius: 10,
    marginTop: 16,
    fontSize: 18,
    color: '#CACACA',
  },
  button: {
    backgroundColor: '#31CECE',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    maxWidth: 320,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  backText: { textAlign: 'center', marginTop: 10, color: '#999' },
  picker: {
    height: 36,
    width: '100%',
    marginTop: 16,
    fontSize: 24,
    letterSpacing: 0.4,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#cacaca",
    textAlign: "left",
    borderWidth: 0,
  },
});