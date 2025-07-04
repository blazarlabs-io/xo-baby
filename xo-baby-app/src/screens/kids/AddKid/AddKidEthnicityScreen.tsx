import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../types/navigation'; 
import { Picker } from '@react-native-picker/picker';


export default function AddKidEthnicityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'AddKidEthnicity'>>();
  const route = useRoute<RouteProp<AppStackParamList, 'AddKidEthnicity'>>();

  const [ethnicity, setEthnicity] = useState('');
  const { firstName, lastName, gender, birthday, bloodtype } = route.params;

  const handleNext = () => {
   navigation.navigate('AddKidLocation', { firstName, lastName, gender, birthday, bloodtype, ethnicity });

  };

  const ethnicityList = [
    { label: 'Asian', value: 'asian' },
    { label: 'Black or African American', value: 'black' },
    { label: 'Hispanic or Latino', value: 'hispanic' },
    { label: 'White', value: 'white' },
    { label: 'Native American', value: 'native_american' },
    { label: 'Middle Eastern', value: 'middle_eastern' },
    { label: 'Pacific Islander', value: 'pacific_islander' },
    { label: 'Other', value: 'other' },
    ];


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
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPoint}></View>
          <View style={styles.progressPoint}></View>
          <View style={styles.progressPoint}></View>
        </View>
      </View>
      <View style={{ marginTop: 24, maxWidth: 172 }}>
        <Text style={styles.title}>Kid’s ethnicity</Text>
      </View>
      <Picker
        selectedValue={ethnicity}
        onValueChange={(value) => setEthnicity(value)}
        style={styles.picker}
        mode="dropdown"
      >
        <Picker.Item label="Choose" value={undefined} />
        {ethnicityList.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>

      <View style={{ position: 'absolute', bottom: 24, width: '92%' }}>
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
    height: 36,
    borderWidth: 0,
    borderRadius: 10,
    marginTop: 16,
    fontSize: 24,
    color: '#CACACA',
  },
  button: {
    backgroundColor: '#31CECE',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
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