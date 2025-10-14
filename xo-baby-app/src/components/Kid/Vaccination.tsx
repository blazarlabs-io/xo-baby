import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../../types/navigation";
import { getVaccinations, Vaccination as ApiVaccination } from "@/api/vaccinationApi";
import { useUserStore } from "@/store/userStore";

interface VaccinationProps {
  kidID: string;
}

const Vaccination: React.FC<VaccinationProps> = ({ kidID }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList, "KidProfile">>();

  // retrieve token from user store
  const user = useUserStore((state) => state.user);
  const token = user?.token;

  const [loading, setLoading] = useState(false);
  const [vaccinations, setVaccinations] = useState<ApiVaccination[]>([]);

  useEffect(() => {
    const loadVaccinations = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const fetched = await getVaccinations(token, kidID, 2);
        setVaccinations(fetched);
      } catch (err) {
        console.error("Error loading vaccinations:", err);
      } finally {
        setLoading(false);
      }
    };
    loadVaccinations();
  }, [token, kidID]);

  const goDetail = () => {
    navigation.navigate("Vaccination", { kidId: kidID });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Vaccination</Text>
        <Text style={styles.seeAll} onPress={goDetail}>
          See All
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator />
      ) : vaccinations.length === 0 ? (
        <View>
          <Text style={styles.noDataText}>No vaccination records yet</Text>
        </View>
      ) : (
        <FlatList
          data={vaccinations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <View style={styles.cardLeftBorder} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>{item.vaccineName}</Text>
                  {item.doseNumber && (
                    <Text style={styles.description}>{item.doseNumber}</Text>
                  )}
                  {item.location && (
                    <Text style={styles.location}>{item.location}</Text>
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
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left",
  },
  seeAll: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#8d8d8d",
    textAlign: "left",
  },
  noDataText: {
    fontSize: 14,
    color: "black",
    fontFamily: "Poppins-Regular",
  },
  cardWrapper: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginTop: 12,
    overflow: "hidden",
    elevation: 1,
  },
  cardLeftBorder: {
    width: 6,
    backgroundColor: "#FFA500",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "column",
    justifyContent: "space-between",
    display: "flex",
    gap: 4,
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left",
  },
  description: {
    width: "100%",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    textAlign: "left",
  },
  location: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    textAlign: "left",
  },
  dateBox: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
    borderColor: "#dce3e3",
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    color: "#31cece",
    textAlign: "left",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    textAlign: "left",
  },
});

export default Vaccination;

