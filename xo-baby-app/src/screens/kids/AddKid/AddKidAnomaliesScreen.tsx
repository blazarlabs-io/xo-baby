import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Modal, KeyboardAvoidingView, Platform  } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../types/navigation'; 
import { styles } from './AddKidAnomaliesScreen.styles';


export default function AddKidAnomaliesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'AddKidAnomalies'>>();
  const route = useRoute<RouteProp<AppStackParamList, 'AddKidAnomalies'>>();

  const [anomalies, setAnomalies] = useState([
		{ id: 1, name: 'Anomaly 1', description: 'Description of Anomaly 1' },
		{ id: 2, name: 'Anomaly 2', description: 'Description of Anomaly 2' },
	]);

	const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const { 
    firstName, 
    lastName, 
    gender, 
    birthday, 
    bloodtype, 
    ethnicity,
    location 
  } = route.params;

  const handleNext = () => {
   navigation.navigate('AddKidAvatar', { 
    firstName, 
    lastName, 
    gender, 
    birthday, 
    bloodtype,  
    ethnicity,
    location,
    anomalies
  });

  };

	const handleAddAnomaly = () => {
    if (newName.trim() !== '') {
      setAnomalies([...anomalies, { id: Date.now(), name: newName, description: newDescription }]);
      setNewName('');
      setNewDescription('');
      setModalVisible(false);
    }
  };

	const onRemoveItem = (id: number) => {
		setAnomalies(anomalies.filter(item => item.id !== id));
	}


  return (
     <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.container}>
      <View style={{ height: 24, flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Image source={require('../../../../assets/common/chevron-left.png')} width={24} height={24} />
        </TouchableOpacity>
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
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPoint}></View>
        </View>
      </View>
      <View style={{ marginTop: 24, maxWidth: 266 }}>
        <Text style={styles.title}>Any congenital anomalies?</Text>
      </View>
			<View style={{ justifyContent: 'center', alignItems: 'center'}}>
				<View style={styles.listContainer}>
					{anomalies.map((item) => (
						<View key={item.id} style={styles.listItem}>
							<Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
							<TouchableOpacity onPress={() => onRemoveItem(item.id)}>
								<Image source={require('../../../../assets/common/x.png')} style={{ width: 24, height: 24 }} />
							</TouchableOpacity>
						</View>
					))}
				</View>
				<TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addItemButton}>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
						<Text style={styles.addItemText}>+ Add New</Text>
					</View>
				</TouchableOpacity>
			</View>
      

      <View style={{ position: 'absolute', bottom: 24, width: '92%' }}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

			<Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Image source={require('../../../../assets/common/x.png')} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Anomaly name</Text>
            <TextInput
              placeholder="Anomaly name"
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
            />
            <Text style={styles.modalTitle}>Description</Text>
            <TextInput
              placeholder="Please describe the anomaly or disease here..."
              style={styles.modalTextArea}
              value={newDescription}
              multiline
              onChangeText={setNewDescription}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
								<Text style={styles.buttonTextCancel}>Cancel</Text>
							</TouchableOpacity>
              <TouchableOpacity onPress={handleAddAnomaly} style={styles.addButton}>
                <Text style={styles.buttonTextAdd}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

