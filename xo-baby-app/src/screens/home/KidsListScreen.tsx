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
import { useUserStore } from "../../store/userStore";
import { useKidStore } from "../../store/kidStore";
import AvatarImage from "../../components/Kid/AvatarImage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function KidsListScreen() {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const kids = useKidStore((state) => state.kids);
  const refreshKids = useKidStore((state) => state.refreshKids);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchKids = async () => {
      if (!user?.token) return;

      setIsLoading(true);
      try {
        await refreshKids(user.token);
      } catch (error) {
        console.error("Error fetching kids:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKids();
  }, [user?.token, refreshKids]);

  const handleKidPress = (kidId: string) => {
    navigation.navigate("KidDetails", { kidId });
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

  // Check if there are any warnings for the kid
  const hasWarnings = (kid: any) => {
    const heartRate = kid.vitals?.heartRate || 140;
    const oximetry = kid.vitals?.oximetry || 93;
    const temperature = kid.vitals?.temperature || 36.6;
    const battery = 90; // This would come from kid data in real implementation
    
    // Check for abnormal vitals
    // Heart rate: normal range 100-160 bpm for infants
    if (heartRate < 100 || heartRate > 160) return true;
    
    // Oxygen saturation: should be >= 95%
    if (oximetry < 95) return true;
    
    // Temperature: normal range 36.5-37.5°C
    if (temperature < 36.5 || temperature > 37.5) return true;
    
    // Battery: warn if below 20%
    if (battery < 20) return true;
    
    return false;
  };

  // Check if individual vitals are abnormal
  const isHeartRateAbnormal = (heartRate: number) => {
    return heartRate < 100 || heartRate > 160;
  };

  const isTemperatureAbnormal = (temperature: number) => {
    return temperature < 36.5 || temperature > 37.5;
  };

  const isOximetryAbnormal = (oximetry: number) => {
    return oximetry < 95;
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
          Loading kids...
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
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../../assets/home-parent/tabs/kid-active.png")}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>My Kids</Text>
        </View>

        {/* Kids List */}
        <View style={styles.content}>
          {kids.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No kids registered</Text>
            </View>
          ) : (
            <>
              {kids.map((kid) => (
                <Pressable
                  key={kid.id}
                  style={styles.kidCard}
                  onPress={() => handleKidPress(kid.id)}
                >
                  {/* Warning Bell Icon */}
                  {hasWarnings(kid) && (
                    <View style={styles.warningBellContainer}>
                      <View style={styles.warningBellBackground}>
                        <MaterialCommunityIcons 
                          name="bell-ring-outline" 
                          size={24} 
                          color="#FF4444" 
                        />
                      </View>
                    </View>
                  )}

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
                    <View style={[
                      styles.vitalItem,
                      isHeartRateAbnormal(kid.vitals?.heartRate || 140) && styles.vitalItemWarning
                    ]}>
                      <View style={styles.heartIcon}>
                        <Image
                          source={require("../../../assets/home-parent/heart.png")}
                          style={styles.heartIcon}
                        />
                      </View>
                      <Text style={styles.vitalValue}>
                        {kid.vitals?.heartRate || 140}
                      </Text>
                    </View>
                    <View style={[
                      styles.vitalItem,
                      isTemperatureAbnormal(kid.vitals?.temperature || 36.6) && styles.vitalItemWarning
                    ]}>
                      <View style={styles.tempIcon}>
                        <Image
                          source={require("../../../assets/home-parent/thermometer.png")}
                          style={styles.tempIcon}
                        />
                      </View>
                      <Text style={styles.vitalValue}>
                        {kid.vitals?.temperature || 36.6}
                      </Text>
                    </View>
                    <View style={[
                      styles.vitalItem,
                      isOximetryAbnormal(kid.vitals?.oximetry || 93) && styles.vitalItemWarning
                    ]}>
                      <View style={styles.oxygenIcon}>
                        <Image
                          source={require("../../../assets/home-parent/lungs.png")}
                          style={styles.oxygenIcon}
                        />
                      </View>
                      <Text style={styles.vitalValue}>
                        {kid.vitals?.oximetry || 93}
                      </Text>
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
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222128",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vitalItemWarning: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FFCCCC',
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
  headerIcon: {
    width: 24,
    height: 24,
  },
  warningBellContainer: {
    position: 'absolute',
    top: -20,
    right: -20,
    zIndex: 10,
  },
  warningBellBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
