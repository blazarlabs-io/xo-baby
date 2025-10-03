import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../../navigation/HomeStack";
import { useUserStore } from "../../store/userStore";
import { useKidStore } from "../../store/kidStore";
import type { Kid } from "../../store/kidStore";
import api from "../../api/axios";
import AvatarImage from "../../components/Kid/AvatarImage";

export default function AdminDashboard() {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);
  const [medicalPersonnel, setMedicalPersonnel] = useState<any[]>([]);
  const kids = useKidStore((state) => state.kids);
  const refreshKids = useKidStore((state) => state.refreshKids);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) return;

      setIsLoading(true);
      try {
        // Fetch kids
        await refreshKids(user.token);

        console.log("📊 AdminDashboard - Kids fetched:", kids.length);
        if (kids.length > 0) {
          console.log("📊 First kid data:", {
            id: kids[0].id,
            firstName: kids[0].firstName,
            lastName: kids[0].lastName,
            avatarUrl: kids[0].avatarUrl,
            gender: kids[0].gender,
          });
        }

        // Fetch medical personnel
        const response = await api.get("/users/medical-personnel");
        setMedicalPersonnel(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.token, refreshKids]);

  const handleKidPress = (kidId: string) => {
    // Admin can view kid details but without medical data
    navigation.navigate("RealTimeData", { kidId });
  };

  const handlePersonnelPress = (personnelId: string) => {
    // Navigate to personnel details (you can implement this later)
    console.log("Personnel pressed:", personnelId);
  };

  // Get kids managed by a specific doctor
  const getKidsByDoctorId = (doctorId: string): Kid[] => {
    return kids.filter((kid) => kid.doctorId === doctorId);
  };

  // Calculate age from birth date
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

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* My Facility Header */}
        <View style={styles.facilityHeader}>
          <Image
            source={require("../../../assets/facility/hospital.png")}
            style={styles.facilityIcon}
          />
          <Text style={styles.facilityTitle}>My Facility</Text>
        </View>

        {/* Hospital Section */}
        <View style={styles.hospitalSection}>
          <View style={styles.hospitalCard}>
            {/* Facility Icon with circular background (similar to AvatarHeader) */}
            <View style={styles.facilityIconWrapper}>
              <View style={styles.facilityIconBorder}>
                <Image
                  source={require("../../../assets/facility/facility-logo.png")}
                  style={styles.facilityIconLarge}
                />
              </View>
            </View>

            {/* Background Image */}
            <View style={styles.facilityBackground}>
              <Image
                source={require("../../../assets/facility/facility.png")}
                style={styles.hospitalImage}
              />
            </View>

            {/* Hospital Name */}
            <View style={styles.hospitalNameContainer}>
              <Text style={styles.hospitalName}>Blazar Hospital</Text>
            </View>
          </View>
        </View>

        {/* My Kids Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Kids</Text>
          </View>

          <View style={styles.sectionContent}>
            {kids.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No kids registered</Text>
              </View>
            ) : (
              <>
                {kids.slice(0, 2).map((kid) => (
                  <Pressable
                    key={kid.id}
                    style={styles.kidCard}
                    onPress={() => handleKidPress(kid.id)}
                  >
                    {/* Main Content Row: Avatar + Kid Info + Status */}
                    <View style={styles.kidMainRow}>
                      {/* Kid Avatar */}
                      <View style={styles.kidAvatar}>
                        <View style={styles.avatarWrapperKid}>
                          <View style={styles.avatarBorderKid}>
                            <AvatarImage
                              avatarUrl={kid.avatarUrl}
                              gender={kid.gender}
                              style={styles.avatarImageKid}
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
                          {/* <Text style={styles.heartSymbol}>♥</Text> */}
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
                  </Pressable>
                ))}

                {/* New Kid Button */}
                {/* <Pressable style={styles.newKidButton}>
                  <Text style={styles.newKidIcon}>+</Text>
                  <Text style={styles.newKidText}>New Kid</Text>
                </Pressable> */}
              </>
            )}
          </View>
        </View>

        {/* My Personnel Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Personnel</Text>
          </View>

          <View style={styles.sectionContent}>
            {medicalPersonnel.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No personnel registered
                </Text>
              </View>
            ) : (
              <>
                {medicalPersonnel.map((person) => {
                  const managedKids = getKidsByDoctorId(person.uid);

                  return (
                    <Pressable
                      key={person.uid}
                      style={styles.personnelCard}
                      onPress={() => handlePersonnelPress(person.uid)}
                    >
                      <View style={styles.personnelMainRow}>
                        <View style={styles.personnelAvatar}>
                          <View style={styles.avatarWrapperPersonnel}>
                            <View style={styles.avatarBorderPersonnel}>
                              <Image
                                source={require("../../../assets/common/user-doctor.png")}
                                style={styles.avatarImagePersonnel}
                              />
                            </View>
                          </View>
                        </View>

                        <View style={styles.personnelInfo}>
                          <Text style={styles.personnelName}>
                            Dr. {person.firstName} {person.lastName}
                          </Text>
                          <Text style={styles.personnelEmail}>
                            {person.email}
                          </Text>
                        </View>

                        <View style={styles.personnelStatus}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <View style={styles.activeStatusDot} />
                            <Text style={styles.activeStatusText}>Active</Text>
                          </View>
                          {managedKids.length > 0 && (
                            <View style={styles.activeKidsContainer}>
                              {managedKids.slice(0, 3).map((kid, index) => (
                                <View
                                  key={kid.id}
                                  style={[
                                    styles.activeKidAvatar,
                                    index > 0 && { marginLeft: -10 },
                                  ]}
                                >
                                  <AvatarImage
                                    avatarUrl={kid.avatarUrl}
                                    gender={kid.gender}
                                    style={styles.activeKidAvatarImage}
                                  />
                                </View>
                              ))}
                              {managedKids.length > 3 && (
                                <View
                                  style={[
                                    styles.activeKidAvatar,
                                    styles.moreKidsIndicator,
                                    { marginLeft: -10 },
                                  ]}
                                >
                                  <Text style={styles.moreKidsText}>
                                    +{managedKids.length - 3}
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}

                {/* New Personnel Button */}
                <Pressable style={styles.newPersonnelButton}>
                  <Text style={styles.newPersonnelIcon}>+</Text>
                  <Text style={styles.newPersonnelText}>New Personnel</Text>
                </Pressable>
              </>
            )}
          </View>
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
  facilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#F8FFFE",
  },
  facilityIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  facilityTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222128",
  },
  hospitalSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  hospitalCard: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  facilityIconWrapper: {
    width: 102,
    height: 102,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#31CECE",
    borderRadius: 102,
    padding: 5,
    zIndex: 2,
    position: "relative",
  },
  facilityIconBorder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 92,
    padding: 8,
    width: 92,
    height: 92,
    justifyContent: "center",
    alignItems: "center",
  },
  facilityIconLarge: {
    width: 92,
    height: 92,
    resizeMode: "contain",
  },
  facilityBackground: {
    position: "absolute",
    top: 65,
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: "center",
    borderRadius: 16,
    overflow: "hidden",
  },
  hospitalImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  hospitalNameContainer: {
    marginTop: 80,
    marginBottom: 16,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222128",
    textAlign: "center",
  },
  section: {
    // backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222128",
  },

  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  avatarWrapperKid: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#31CECE",
    borderRadius: 32,
    padding: 3,
  },
  avatarBorderKid: {
    backgroundColor: "#FFFFFF",
    borderRadius: 29,
    padding: 2,
    width: 58,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImageKid: {
    width: 54,
    height: 54,
    borderRadius: 27,
    // borderWidth: 2,
    // borderColor: '#4ECDC4',
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
  newKidButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4ECDC4",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
  },
  newKidIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    marginRight: 8,
  },
  newKidText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  personnelCard: {
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
  personnelMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  personnelAvatar: {
    marginRight: 12,
  },
  avatarWrapperPersonnel: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#31CECE",
    borderRadius: 32,
    padding: 3,
  },
  avatarBorderPersonnel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 29,
    padding: 2,
    width: 58,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImagePersonnel: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  personnelInfo: {
    flex: 1,
  },
  personnelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222128",
    marginBottom: 4,
  },
  personnelEmail: {
    fontSize: 14,
    color: "#666",
  },
  personnelStatus: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  activeStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ECDC4",
  },
  activeStatusText: {
    fontSize: 12,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  personnelBadge: {
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 14,
    color: "#666",
  },
  newPersonnelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4ECDC4",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
  },
  newPersonnelIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    marginRight: 8,
  },
  newPersonnelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  kidMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  heartIcon: {
    // width: 24,
    // height: 24,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: '#FFE0E0',
    borderRadius: 12,
  },
  heartSymbol: {
    fontSize: 18,
    color: "#FF6B6B",
  },
  tempIcon: {
    // width: 24,
    // height: 24,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: '#E0E0FF',
    borderRadius: 12,
  },
  tempSymbol: {
    fontSize: 18,
    color: "#6B6BFF",
  },
  oxygenIcon: {
    // width: 24,
    // height: 24,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: '#E0FFE0',
    borderRadius: 12,
  },
  oxygenSymbol: {
    fontSize: 18,
    color: "#6BFF6B",
  },
  healthIcon: {
    // width: 24,
    // height: 24,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: '#E0E0E0',
    borderRadius: 12,
  },
  healthSymbol: {
    fontSize: 18,
    color: "#666",
  },
  activeKidsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  activeKidAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#F5F5F5",
    overflow: "hidden",
  },
  activeKidAvatarImage: {
    width: "100%",
    height: "100%",
  },
  moreKidsIndicator: {
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
  },
  moreKidsText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
