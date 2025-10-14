import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../types/navigation";
import { Platform } from "react-native";

import { createUser } from "../../../api/userApi";
import { useUserStore } from "../../../store/userStore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { ROLE_LABELS } from "../../../constants/roles";

export default function SignupConfirmPasswordScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        AuthStackParamList,
        "SignupConfirmPasswordScreen"
      >
    >();
  const route =
    useRoute<RouteProp<AuthStackParamList, "SignupConfirmPasswordScreen">>();

  const [passwordConfirm, setPasswordConfirm] = useState("");
  const { name, email, password } = route.params;
  const { setUser, selectedRole, clearSelectedRole } = useUserStore();

  const [firstName, ...rest] = name.trim().split(" ");
  const lastName = rest.join(" ");

  const handleConfirm = async () => {
    console.log('Create button pressed!'); // Debug log
    if (passwordConfirm.trim() === password) {
      Keyboard.dismiss();

      // Use selectedRole or default to parent
      const userRole = selectedRole || "parent";

      try {
        const response = await createUser({
          firstName,
          lastName,
          email,
          password,
          role: userRole,
        });

        // get JWT token
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const idToken = await userCredential.user.getIdToken();

        setUser({
          uid: response.uid,
          email: response.email,
          token: idToken,
          role: userRole,
        });

        // Clear the temporary selected role
        clearSelectedRole();
      } catch (err) {
        console.error("User creation failed:", err);
      }
    } else {
      console.error("Password dont match");
    }
  };

  return (
    <LinearGradient colors={["#E2F3F3", "#E2FFFF"]} style={styles.container}>
      {/* <ScrollView showsVerticalScrollIndicator={false}> */}
        <View
          style={{
            height: 24,
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          <View style={styles.backBtn}>
            <Text>Back</Text>
          </View>
          <View style={styles.headerText}>
            <Text>Create Account</Text>
          </View>
        </View>
        <View
          style={{
            marginTop: 24,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              gap: 8,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={styles.progressPointActive}></View>
            <View style={styles.progressPointActive}></View>
            <View style={styles.progressPointActive}></View>
            <View style={styles.progressPointActive}></View>
          </View>
        </View>

        {/* Show selected role */}
        <View style={{ marginTop: 24, marginBottom: 16, alignItems: "center" }}>
          <Text style={styles.roleIndicatorText}>
            Creating account as: {ROLE_LABELS[selectedRole || "parent"]}
          </Text>
        </View>

        <View style={{ marginTop: 24, maxWidth: 172 }}>
          <Text style={styles.title}>Confirm password</Text>
        </View>
        <TextInput
          style={[
            styles.input,
            Platform.select({
              android: { paddingVertical: 8, textAlignVertical: "center" }, // avoid clipping
            }),
          ]}
          placeholder="********"
          secureTextEntry
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          onSubmitEditing={handleConfirm}
          returnKeyType="done"
        />

        {/* <View style={{ marginTop: 40, alignItems: 'center', paddingBottom: 100 }}> */}
        <View
          style={{
            position: "absolute",
            bottom: 24,
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Pressable 
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]} 
            onPress={handleConfirm}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.3)' }}
          >
            <Text style={styles.buttonText}>Create</Text>
          </Pressable>
          <Pressable 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
          >
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>
      {/* </ScrollView> */}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    borderWidth: 1,
    borderColor: "#CACACA",
    width: 54,
    height: 24,
    borderRadius: 4,
    position: "absolute",
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // Ensure minimum touch target
  },
  container: { flex: 1, padding: 24 },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    justifyContent: "center",
    textAlign: "center",
  },
  progressPointActive: {
    width: 12,
    height: 12,
    borderRadius: 50,
    backgroundColor: "#31CECE",
  },
  progressPoint: {
    width: 12,
    height: 12,
    borderRadius: 50,
    backgroundColor: "#CACACA",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 42,
    letterSpacing: 1.5,
    color: "#222128",
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 0,
    borderRadius: 10,
    marginTop: 16,
    fontSize: 18,
    color: "#CACACA",
  },
  button: {
    backgroundColor: "#31CECE",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    maxWidth: 320,
    minHeight: 48, // Ensure minimum touch target for Android
    elevation: 2, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  backText: { textAlign: "center", marginTop: 10, color: "#999" },
  backButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  roleIndicatorText: {
    fontSize: 16,
    color: "#31CECE",
    fontWeight: "600",
    textAlign: "center",
  },
});
