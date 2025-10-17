import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useKidStore } from "../../store/kidStore";
import { useUserStore } from "../../store/userStore";
import type { Kid } from "../../store/kidStore";
import AvatarImage from "../../components/Kid/AvatarImage";
import Feather from "@expo/vector-icons/Feather";
import api from "../../api/axios";

export default function UnassignedKidsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { doctorId } = route.params;

  console.log('UnassignedKidsScreen received doctorId:', doctorId);

  const kids = useKidStore((state) => state.kids);
  const user = useUserStore((state) => state.user);
  const refreshKids = useKidStore((state) => state.refreshKids);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleKidPress = (kidId: string) => {
    Alert.alert(
      "Assign Child",
      "Are you sure you want to assign this child to the doctor?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign",
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log('Assigning kid:', kidId, 'to doctor:', doctorId);
              // Assign kid to doctor
              const response = await api.put(`/kid/${kidId}/assign-doctor`, { doctorId });
              console.log('Assignment response:', response.data);
              // Refresh kids list
              if (user?.token) {
                await refreshKids(user.token);
              }
              Alert.alert("Success", "Child has been assigned to the doctor");
              navigation.goBack();
            } catch (error: any) {
              console.error("Error assigning kid:", error);
              console.error("Error response:", error.response?.data);
              console.error("Error status:", error.response?.status);
              Alert.alert("Error", "Failed to assign child to doctor");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const getUnassignedKids = (): Kid[] => {
    return kids.filter(kid => !kid.doctorId || kid.doctorId === null);
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

  const unassignedKids = getUnassignedKids();

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Assigning child...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Assign Children</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Unassigned Kids List */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Unassigned Children ({unassignedKids.length})
            </Text>
          </View>

          {unassignedKids.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No unassigned children available
              </Text>
            </View>
          ) : (
            <>
              {unassignedKids.map((kid) => (
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

                  {/* Assign Button */}
                  <Pressable
                    style={styles.assignButton}
                    onPress={() => handleKidPress(kid.id)}
                  >
                    <View style={styles.assignButtonIcon}>
                      <Feather name="plus" size={16} color="#4ECDC4" />
                    </View>
                    <Text style={styles.assignButtonText}>Assign</Text>
                  </Pressable>
                </Pressable>
              ))}
            </>
          )}
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
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
  avatarWrapper: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#31CECE",
    borderRadius: 32,
    padding: 3,
  },
  avatarBorder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 29,
    padding: 2,
    width: 58,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  assignButton: {
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
  assignButtonIcon: {
    width: 18,
    height: 18,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#4ECDC4",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  assignButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4ECDC4",
  },
});
