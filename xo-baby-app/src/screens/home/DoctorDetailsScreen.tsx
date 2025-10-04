import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useKidStore } from "../../store/kidStore";
import { useUserStore } from "../../store/userStore";
import type { Kid } from "../../store/kidStore";
import AvatarImage from "../../components/Kid/AvatarImage";
import Feather from "@expo/vector-icons/Feather";
import api from "../../api/axios";

export default function DoctorDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { doctor } = route.params;

  const kids = useKidStore((state) => state.kids);
  const user = useUserStore((state) => state.user);
  const refreshKids = useKidStore((state) => state.refreshKids);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleKidPress = (kidId: string) => {
    (navigation as any).navigate("KidDetails", { kidId });
  };

  const handleRemoveKid = async (kidId: string) => {
    Alert.alert(
      "Remove Kid Assignment",
      "Are you sure you want to remove this kid from the doctor's assignment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              // Update kid to remove doctor assignment
              await api.put(`/kid/${kidId}/assign-doctor`, { doctorId: null });
              // Refresh kids list
              if (user?.token) {
                await refreshKids(user.token);
              }
              Alert.alert("Success", "Kid has been removed from doctor assignment");
            } catch (error) {
              console.error("Error removing kid assignment:", error);
              Alert.alert("Error", "Failed to remove kid assignment");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDisableAccount = () => {
    Alert.alert(
      "Disable Account",
      "Are you sure you want to disable this doctor's account? They will not be able to access the system.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disable",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await api.put(`/users/${doctor.uid}/disable`);
              Alert.alert("Success", "Doctor account has been disabled");
              navigation.goBack();
            } catch (error) {
              console.error("Error disabling account:", error);
              Alert.alert("Error", "Failed to disable account");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete this doctor's account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await api.delete(`/users/${doctor.uid}`);
              Alert.alert("Success", "Doctor account has been deleted");
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert("Error", "Failed to delete account");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const getKidsByDoctorId = (doctorId: string): Kid[] => {
    return kids.filter((kid) => kid.doctorId === doctorId);
  };

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
      return `${weeks} weeks`;
    } else {
      const years = Math.floor(weeks / 52);
      const remainingWeeks = weeks % 52;
      return remainingWeeks > 0
        ? `${years}y ${remainingWeeks}w`
        : `${years} years`;
    }
  };

  if (!doctor) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ fontSize: 16, color: "#666" }}>Doctor not found</Text>
      </View>
    );
  }

  const managedKids = getKidsByDoctorId(doctor.uid);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="chevron-left" size={24} color="#222128" />
          </Pressable>
          <Text style={styles.headerTitle}>Personnel Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Doctor Info Section */}
        <View style={styles.doctorInfoSection}>
          <View style={styles.doctorAvatar}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarBorder}>
                <Image
                  source={require("../../../assets/common/user-doctor.png")}
                  style={styles.avatarImage}
                />
              </View>
            </View>
          </View>

          <Text style={styles.doctorName}>
            Dr. {doctor.firstName} {doctor.lastName}
          </Text>
          <Text style={styles.doctorEmail}>{doctor.email}</Text>

          <View style={styles.doctorStatus}>
            <View style={styles.activeStatusDot} />
            <Text style={styles.activeStatusText}>Active</Text>
          </View>
        </View>

        {/* Assigned Kids Section */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            {/* <Image
              source={require("../../../assets/home-parent/tabs/kid-active.png")}
              style={styles.sectionIcon}
            /> */}
            <Text style={styles.sectionTitle}>
              Assigned Kids ({managedKids.length})
            </Text>
          </View>

          {managedKids.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No kids assigned to this doctor
              </Text>
            </View>
          ) : (
            <>
              {managedKids.map((kid) => (
                <Pressable
                  key={kid.id}
                  style={styles.kidCard}
                  onPress={() => handleKidPress(kid.id)}
                >
                  {/* Main Content Row: Avatar + Kid Info + Status */}
                  <View style={styles.kidMainRow}>
                    {/* Kid Avatar */}
                    <View style={styles.kidAvatar}>
                      <View style={styles.avatarWrapper}>
                        <View style={styles.avatarBorder}>
                          <AvatarImage
                            avatarUrl={kid.avatarUrl}
                            gender={kid.gender}
                            style={styles.avatarImage}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Kid Info (Name + Age) */}
                    <View style={styles.kidInfo}>
                      <Text style={styles.kidName}>
                        {kid.firstName} {kid.lastName}
                      </Text>
                      <Text style={styles.kidAge}>
                        {calculateAge(kid.birthDate)}
                      </Text>
                    </View>

                    {/* Status and Battery */}
                    <View style={styles.kidStatus}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>Online</Text>
                      <Text style={styles.batteryText}>90%</Text>
                      <View style={styles.batteryIcon}>
                        <View style={styles.batteryFill} />
                      </View>
                    </View>
                  </View>

                  {/* Vitals Row */}
                  <View style={styles.kidVitals}>
                    <View style={styles.vitalItem}>
                      <View style={styles.heartIcon}>
                        <Image
                          source={require("../../../assets/home-parent/heart.png")}
                          style={styles.heartIcon}
                        />
                      </View>
                      <Text style={styles.vitalValue}>140</Text>
                    </View>
                    <View style={styles.vitalItem}>
                      <View style={styles.tempIcon}>
                        <Image
                          source={require("../../../assets/home-parent/thermometer.png")}
                          style={styles.tempIcon}
                        />
                      </View>
                      <Text style={styles.vitalValue}>36.2</Text>
                    </View>
                    <View style={styles.vitalItem}>
                      <View style={styles.oxygenIcon}>
                        <Image
                          source={require("../../../assets/home-parent/lungs.png")}
                          style={styles.oxygenIcon}
                        />
                      </View>
                      <Text style={styles.vitalValue}>52</Text>
                    </View>
                    <View style={styles.vitalItem}>
                      <View style={styles.healthIcon}>
                        <Image
                          source={require("../../../assets/home-parent/O2.png")}
                          style={styles.healthIcon}
                        />
                      </View>
                      <Text style={styles.vitalValue}>98%</Text>
                    </View>
                  </View>

                  {/* Remove Button */}
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => handleRemoveKid(kid.id)}
                  >
                    <View style={styles.removeButtonIcon}>
                      <Feather name="x" size={16} color="#4ECDC4" />
                    </View>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                </Pressable>
              ))}
            </>
          )}
        </View>

        {/* Account Management Buttons */}
        <View style={styles.accountManagementSection}>
          <Pressable
            style={styles.disableAccountButton}
            onPress={handleDisableAccount}
            disabled={isLoading}
          >
            <Text style={styles.disableAccountButtonText}>Disable Access</Text>
          </Pressable>
          
          <Pressable
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
            disabled={isLoading}
          >
            <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFFE",
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#F8FFFE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CACACA",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222128",
    textAlign: "center",
  },
  doctorInfoSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  doctorAvatar: {
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#31CECE",
    borderRadius: 40,
    padding: 3,
  },
  avatarBorder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 37,
    padding: 2,
    width: 74,
    height: 74,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222128",
    marginBottom: 8,
    textAlign: "center",
  },
  doctorEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  doctorStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    // marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },  shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activeStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4ECDC4",
  },
  activeStatusText: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  sectionIcon: {
    width: 24,
    height: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222128",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222128",
    textAlign: "center",
  },
  kidCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  kidAvatar: {
    alignSelf: "flex-start",
  },
  kidInfo: {
    flex: 1,
    marginLeft: 16,
  },
  kidName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222128",
    marginBottom: 4,
  },
  kidAge: {
    fontSize: 14,
    color: "#666",
  },
  kidStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ECDC4",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  batteryText: {
    fontSize: 12,
    color: "#666",
  },
  batteryIcon: {
    width: 20,
    height: 10,
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 1,
  },
  batteryFill: {
    width: "90%",
    height: 6,
    backgroundColor: "#4CAF50",
    borderRadius: 1,
  },
  kidVitals: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  vitalItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222128",
  },
  kidMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  heartIcon: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  tempIcon: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  oxygenIcon: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  healthIcon: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#4ECDC4",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  removeButtonIcon: {
    width: 18,
    height: 18,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#4ECDC4",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  accountManagementSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
    marginTop: 20,
  },
  disableAccountButton: {
    backgroundColor: "#FF4444",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#FF4444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  disableAccountButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  deleteAccountButton: {
    backgroundColor: "transparent",
    borderRadius: 50,
    // borderWidth: 2,
    borderColor: "#FF4444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteAccountButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
  },
});
