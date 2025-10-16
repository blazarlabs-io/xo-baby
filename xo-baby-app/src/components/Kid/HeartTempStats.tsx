import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export default function HeartAndTempStats() {
  const screenWidth = Dimensions.get("window").width;
  const [temperature, setTemperature] = useState<number>(36.5);
  const [heartRate, setHeartRate] = useState<number>(93);
  const [heartRateData, setHeartRateData] = useState<number[]>([
    93, 95, 92, 96, 94, 93, 95, 92, 94, 93, 96, 94, 93, 95,
  ]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Heart rate: 85-105 BPM
      setHeartRate((prev) => {
        const jitter = Math.round((Math.random() - 0.5) * 8); // -4..+4
        const newHR = clamp((prev || 93) + jitter, 85, 105);
        
        // Update the graph data with new heart rate
        setHeartRateData((prevData) => {
          const newData = [...prevData.slice(1), newHR];
          return newData;
        });
        
        return newHR;
      });

      // Temperature: 36.0-37.5°C
      setTemperature((prev) => {
        const jitter = (Math.random() - 0.5) * 0.4; // -0.2..+0.2
        return clamp(Number(((prev || 36.5) + jitter).toFixed(1)), 36.0, 37.5);
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, []);

  const data = {
    labels: [],
    datasets: [
      {
        data: heartRateData,
        color: () => "#31CECE",
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <LineChart
          data={data}
          width={119}
          height={40}
          withHorizontalLabels={false}
          withVerticalLabels={false}
          withDots={false}
          withShadow={false}
          withInnerLines={false}
          withOuterLines={false}
          chartConfig={{
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientTo: "#FFFFFF",
            color: () => "#31CECE",
            propsForBackgroundLines: {
              strokeWidth: 0,
            },
          }}
          style={styles.graph}
        />
        <View style={styles.valueRow}>
          <Image
            source={require("../../../assets/home-parent/heart-large.png")}
            style={styles.icon}
          />
          <Text style={styles.valueText}>{heartRate}</Text>
          <Text style={styles.unitText}>BPM</Text>
        </View>
      </View>

      <View style={styles.card}>
        <LinearGradient
          colors={["#26E2FF", "#FBF073", "#FA63FD"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />
        <View style={styles.valueRow}>
          <Image
            source={require("../../../assets/home-parent/thermometer-large.png")}
            style={styles.icon}
          />
          <Text style={styles.valueText}>{temperature}</Text>
          <Text style={styles.unitText}>℃</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    width: "100%",
    gap: 16,
  },
  card: {
    minWidth: 119,
    minHeight: 83,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  gradientBar: {
    width: 119,
    height: 35,
    borderRadius: 8,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginTop: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
  valueText: {
    fontSize: 24,
    letterSpacing: 0.5,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
  },
  unitText: {
    fontSize: 12,
    letterSpacing: 0.2,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    marginLeft: 4,
  },
  graph: {
    marginBottom: 8,
    paddingRight: 0,
  },
});
