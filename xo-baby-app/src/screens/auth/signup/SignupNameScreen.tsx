import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../types/navigation";
import { Platform } from "react-native";
import { useUserStore } from "../../../store/userStore";
import { signInWithGoogle } from "../../../services/googleSignIn";
import Constants from 'expo-constants';

export default function SignupNameScreen() {
  const [name, setName] = useState("");
  const navigation =
    useNavigation<
      NativeStackNavigationProp<AuthStackParamList, "SignupNameScreen">
    >();
  const { setUser, selectedRole, clearSelectedRole } = useUserStore();

  const handleNext = () => {
    if (name.trim()) {
      Keyboard.dismiss();
      navigation.navigate("SignupEmailScreen", { name });
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      console.log("🔍 Starting Google Sign-Up...");

      const result = await signInWithGoogle();
      const { user: firebaseUser, userInfo } = result;

      console.log("🔍 Google Sign-Up successful:", {
        firebaseUser: firebaseUser.uid,
        email: firebaseUser.email,
        userInfo,
      });

      // Get the Firebase token
      const token = await firebaseUser.getIdToken();

      // Check if user already exists in backend
      try {
        const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'https://xo-baby.blazarlabs.io';
        const response = await fetch(
          `${apiUrl}/users/verify-token`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // User already exists - this is actually a sign-in, not sign-up
          const userProfile = await response.json();
          console.log("🔍 Google Sign-Up - User already exists:", userProfile);

          Alert.alert(
            "Account Already Exists",
            "An account with this Google email already exists. Please use the Login option instead.",
            [{ text: "OK" }]
          );
          return;
        } else {
          // User doesn't exist - proceed with sign-up
          console.log("🔍 Google Sign-Up - Creating new account");

          // For new Google users, use selected role or default to parent
          const userRole = selectedRole || "parent";

          // Create user profile in backend
          const createResponse = await fetch(
            `${apiUrl}/users/create-google`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                firstName:
                  userInfo?.givenName ||
                  firebaseUser.displayName?.split(" ")[0] ||
                  "User",
                lastName:
                  userInfo?.familyName ||
                  firebaseUser.displayName?.split(" ").slice(1).join(" ") ||
                  "",
                email: firebaseUser.email,
                uid: firebaseUser.uid,
                role: userRole,
              }),
            }
          );

          if (createResponse.ok) {
            const createdUser = await createResponse.json();
            console.log(
              "🔍 Google Sign-Up - User created successfully:",
              createdUser
            );

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              token: token,
              role: userRole,
            });

            clearSelectedRole();

            Alert.alert(
              "Account Created!",
              "Your Google account has been successfully registered.",
              [{ text: "OK" }]
            );
          } else {
            const errorData = await createResponse.json();
            console.error(
              "🔍 Google Sign-Up - Backend creation failed:",
              errorData
            );

            // Fallback: set user with default role
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              token: token,
              role: userRole,
            });

            clearSelectedRole();
          }
        }
      } catch (profileError) {
        console.warn("Failed to check/create user profile:", profileError);

        // Fallback: set user with selected role or default
        const fallbackRole = selectedRole || "parent";
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          token: token,
          role: fallbackRole,
        });

        clearSelectedRole();
      }
    } catch (error: any) {
      console.error("Google Sign-Up error:", error);
      Alert.alert(
        "Google Sign-Up Failed",
        error.message ||
          "An error occurred during Google Sign-Up. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient colors={["#E2F3F3", "#E2FFFF"]} style={styles.container}>
      <View
        style={{
          height: 24,
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 16,
        }}
      >
        <Pressable style={styles.backBtn} onPress={handleBackPress}>
          <Text>Back</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text>Sign Up</Text>
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
          <View style={styles.progressPoint}></View>
          <View style={styles.progressPoint}></View>
          <View style={styles.progressPoint}></View>
        </View>
      </View>
      <View style={{ marginTop: 24, maxWidth: 172 }}>
        <Text style={styles.title}>Enter your name</Text>
      </View>
      <TextInput
        style={[
          styles.input,
          Platform.select({
            android: { paddingVertical: 8, textAlignVertical: "center" }, // avoid clipping
          }),
        ]}
        placeholder="John Doe"
        autoCapitalize="none"
        value={name}
        onChangeText={setName}
        onSubmitEditing={handleNext}
        returnKeyType="done"
      />

      {/* Google Sign Up Button */}
      <View style={styles.googleSignUpContainer}>
        <Pressable style={styles.socialButton} onPress={handleGoogleSignUp}>
          <View style={styles.socialButtonContent}>
            <Image
              source={require('../../../../assets/common/google-icon.png')}
              style={styles.socialIcon}
              resizeMode="cover"
            />
            <Text style={styles.socialText}>Sign Up With Google</Text>
          </View>
        </Pressable>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
        <Pressable onPress={handleBackPress}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
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
    cursor: "pointer",
    position: "absolute",
    left: 0,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  googleSignUpContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  socialButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#DCE3E3",
    marginVertical: 5,
    width: "90%",
    maxWidth: 320,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "white",
  },
  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  socialIcon: {
    width: 15,
    height: 15,
    position: "absolute",
    left: 5,
  },
  socialText: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#31CECE",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    maxWidth: 320,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  backText: { textAlign: "center", marginTop: 10, color: "#999" },
});
