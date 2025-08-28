import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../types/navigation'; 

import { useKidStore } from '../../../store/kidStore';
import { createKid } from '../../../api/kidApi';
import { useUserStore } from '../../../store/userStore';


export default function AddKidAvatarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'AddKidAvatar'>>();
  const route = useRoute<RouteProp<AppStackParamList, 'AddKidAvatar'>>();

  const { user } = useUserStore();
  const addKid = useKidStore((state) => state.addKid);

  const { 
    firstName, 
    lastName, 
    gender, 
    birthday, 
    bloodtype, 
    ethnicity,
    location,
    anomalies
  } = route.params;

  const handleCreateKid = async () => {
    try {
      const newKid = await createKid({
        firstName,
        lastName,
        birthDate: birthday,
        gender,
        bloodType: bloodtype,
        ethnicity,
        location,
        congenitalAnomalies: anomalies,
        avatarUrl: '', 
        parentId: user?.uid || '8l4p3sgjJ0g6NYLErsB4HBeW70a2',
      });

      addKid(newKid);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Tabs' as never,
            params: {
              screen: 'MyKids',
              params: {
                screen: 'Home',
                params: { focusKidId: newKid.id },
              },
            } as never,
          },
        ],
      });
    } catch (error) {
      console.error('Failed to create kid:', error);
      // show error to user
    }
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
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
          <View style={styles.progressPointActive}></View>
        </View>
      </View>
      <View style={{ marginTop: 24, maxWidth: 266 }}>
        <Text style={styles.title}>Kid's avatar</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.contentTitle}>Choose Avatar</Text>
        <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
                <Image
                  source={require('../../../../assets/kids/avatar-girl.png')}
                  style={{ width: 48, height: 48, borderRadius: 80 }}/>
            </View>
            <View style={styles.avatar}>
                <Image
                  source={require('../../../../assets/kids/avatar-boy.png')}
                  style={{ width: 48, height: 48, borderRadius: 80 }}/>
            </View>
        </View>
        <Text style={[ styles.contentTitle, {marginTop: 4, color: '#7c768a'}]}>Or</Text>
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 16 }}>
            <Image source={require('../../../../assets/common/image.png')} style={{ width: 16, height: 16 }} />
            <Text style={styles.uploadImageText}>Choose from library</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 }}>
            <Image source={require('../../../../assets/common/device-camera.png')} style={{ width: 16, height: 16 }} />
            <Text style={styles.uploadImageText}>Take a photo</Text>
        </View>
      </View>
      

      <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' }}>
        <Pressable style={styles.button} onPress={handleCreateKid}>
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
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 16,
  },
  contentTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Poppins-Regular",
    color: "#222128",
    textAlign: "left"
  },
  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4
  },
  avatar: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  uploadImageText: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#31cece",
    textAlign: "left"
  },
});