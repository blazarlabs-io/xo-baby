import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { AppStackParamList } from "../../types/navigation";
import { useKidStore } from "../../store/kidStore";
import { useUserStore } from "@/store/userStore";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import {
  getVaccinations,
  createVaccination,
  Vaccination as ApiVaccination,
} from "@/api/vaccinationApi";

type VaccinationProp = RouteProp<AppStackParamList, "Vaccination">;

export default function VaccinationScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<AppStackParamList, "Vaccination">
    >();
  const route = useRoute<VaccinationProp>();
  const { kidId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const kid = useKidStore((state) => state.kids.find((k) => k.id === kidId));
  const user = useUserStore((state) => state.user);
  const token = user?.token;

  const [vaccinations, setVaccinations] = useState<ApiVaccination[]>([]);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newVaccineName, setNewVaccineName] = useState("");
  const [newDoseNumber, setNewDoseNumber] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newAdministeredBy, setNewAdministeredBy] = useState("");

  useEffect(() => {
    const loadVaccinations = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const fetched = await getVaccinations(token, kidId, 20);
        setVaccinations(fetched);
      } catch (err) {
        console.error("Error loading vaccinations:", err);
      } finally {
        setLoading(false);
      }
    };
    loadVaccinations();
  }, [token, kidId]);

  const handleAddVaccination = async () => {
    if (!newDate || !newTime || !newVaccineName || !token) return;
    setLoading(true);
    try {
      const payload = {
        date: newDate,
        time: newTime,
        vaccineName: newVaccineName,
        doseNumber: newDoseNumber,
        notes: newNotes,
        location: newLocation,
        administeredBy: newAdministeredBy,
        kidId,
      };
      const created = await createVaccination(token, payload);
      setVaccinations((prev) => [created, ...prev]);
      setModalVisible(false);
      setNewDate("");
      setNewTime("");
      setNewVaccineName("");
      setNewDoseNumber("");
      setNewNotes("");
      setNewLocation("");
      setNewAdministeredBy("");
    } catch (error) {
      console.error("Failed to create vaccination", error);
    } finally {
      setLoading(false);
    }
  };

  if (!kid) return <Text>Kid not found</Text>;

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "Unknown age";

    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);

    if (weeks < 4) {
      return `${diffDays} days`;
    } else if (weeks < 52) {
      const months = Math.floor(weeks / 4);
      return `${months} ${months === 1 ? "month" : "months"}`;
    }
    return `${Math.floor(weeks / 52)} years`;
  };

  return (
    <LinearGradient
      colors={["#E2F3F3", "#E2FFFF"]}
      style={{ width: "100%", flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.componentHeaderContainer}>
          <Image
            source={require("../../../assets/home-parent/calendar.png")}
            style={{ width: 20, height: 20 }}
          />
          <Text style={styles.realTimeText}>Vaccination</Text>
        </View>
        <View style={styles.kidCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorder}>
              <Image
                source={require("../../../assets/kids/avatar-girl.png")}
                style={styles.avatarImage}
              />
            </View>
          </View>
          <View style={styles.kidInfoContainer}>
            <Text style={styles.kidName}>
              {kid.firstName} {kid.lastName}
            </Text>
            <Text style={styles.kidAge}>{calculateAge(kid.birthDate)}</Text>
          </View>
        </View>

        <View
          style={{
            width: "100%",
            marginTop: 32,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.sectionTitle}>All Records</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Image
              source={require("../../../assets/home-parent/add.png")}
              style={{ width: 14, height: 14 }}
            />
          </Pressable>
        </View>

        <View style={{ gap: 16, marginTop: 16, width: "100%" }}>
          {loading ? (
            <ActivityIndicator />
          ) : vaccinations.length === 0 ? (
            <Text style={styles.noDataText}>No vaccination records yet</Text>
          ) : (
            vaccinations.map((item) => (
              <View key={item.id} style={styles.cardWrapper}>
                <View style={styles.cardLeftBorder} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.title}>{item.vaccineName}</Text>
                    {item.doseNumber && (
                      <Text style={styles.description}>{item.doseNumber}</Text>
                    )}
                    {item.administeredBy && (
                      <Text style={styles.description}>
                        By: {item.administeredBy}
                      </Text>
                    )}
                    {item.location && (
                      <Text style={styles.location}>{item.location}</Text>
                    )}
                    {item.notes && (
                      <Text style={styles.notes}>{item.notes}</Text>
                    )}
                  </View>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateLabel}>{item.date}</Text>
                    <View style={styles.timeRow}>
                      <Image
                        source={require("../../../assets/home-parent/clock.png")}
                        alt="clock"
                        style={{ width: 10, height: 10 }}
                      />
                      <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ position: "relative", width: "92%", marginTop: 50 }}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Add Vaccination Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Vaccination</Text>

              <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD)"
                value={newDate}
                onChangeText={setNewDate}
              />
              <TextInput
                style={styles.input}
                placeholder="Time (HH:MM)"
                value={newTime}
                onChangeText={setNewTime}
              />
              <TextInput
                style={styles.input}
                placeholder="Vaccine Name"
                value={newVaccineName}
                onChangeText={setNewVaccineName}
              />
              <TextInput
                style={styles.input}
                placeholder="Dose Number (Optional)"
                value={newDoseNumber}
                onChangeText={setNewDoseNumber}
              />
              <TextInput
                style={styles.input}
                placeholder="Administered By (Optional)"
                value={newAdministeredBy}
                onChangeText={setNewAdministeredBy}
              />
              <TextInput
                style={styles.input}
                placeholder="Location (Optional)"
                value={newLocation}
                onChangeText={setNewLocation}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notes (Optional)"
                value={newNotes}
                onChangeText={setNewNotes}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddVaccination}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Saving..." : "Save"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    width: "100%",
  },
  componentHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 4,
  },
  realTimeText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left",
  },
  kidCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 8,
    width: "100%",
    elevation: 2,
    marginTop: 24,
  },
  avatarWrapper: {
    width: 47,
    height: 47,
    borderRadius: 47,
    backgroundColor: "#31CECE",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBorder: {
    width: 38,
    height: 38,
    borderRadius: 38,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 38,
  },
  kidInfoContainer: {
    marginLeft: 8,
    flex: 1,
  },
  kidName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222128",
  },
  kidAge: {
    fontSize: 14,
    color: "#888",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#212129",
  },
  addButton: {
    padding: 12,
    borderRadius: 32,
    justifyContent: "center",
    backgroundColor: "#31cece",
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginTop: 20,
  },
  cardWrapper: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeftBorder: {
    width: 4,
    backgroundColor: "#4ECDC4",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  cardHeader: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#212129",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Poppins-Regular",
    marginBottom: 2,
  },
  notes: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginTop: 4,
    fontStyle: "italic",
  },
  dateBox: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Poppins-Regular",
  },
  backText: {
    textAlign: "center",
    marginTop: 10,
    color: "#999",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    margin: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#212129",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#31CECE",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
  },
});

