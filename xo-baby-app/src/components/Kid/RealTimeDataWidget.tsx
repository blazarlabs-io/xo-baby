import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../../types/navigation";
import { useKidStore } from "../../store/kidStore";

interface RealTimeDataProps {
  heartRate?: number;
  temperature?: number;
  respiration?: number;
  oxygen?: number;
  deviceName?: string;
  kidID: string;
  isConnectedBl?: boolean;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const RealTimeDataWidget: React.FC<RealTimeDataProps> = ({
  heartRate,
  temperature,
  respiration,
  oxygen,
  deviceName,
  kidID,
  isConnectedBl = true,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList, "KidProfile">>();

  const goDetail = () => {
    navigation.navigate("RealTimeData", { kidId: kidID });
  };

  const formatValue = (value?: number | string) =>
    value !== undefined && value !== null && value !== "" ? value : "-";
  const [hr, setHr] = useState<number>(heartRate ?? 93);
  const [temp, setTemp] = useState<number>(temperature ?? 36.5);
  const [resp, setResp] = useState<number>(respiration ?? 18);
  const [o2, setO2] = useState<number>(oxygen ?? 98);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isConnectedBl) return; // no simulation, keep whatever is in props/state

    setHr((prev) => (typeof heartRate === "number" ? heartRate : prev));
    setTemp((prev) => (typeof temperature === "number" ? temperature : prev));
    setResp((prev) => (typeof respiration === "number" ? respiration : prev));
    setO2((prev) => (typeof oxygen === "number" ? oxygen : prev));

    intervalRef.current = setInterval(() => {
      // Heart rate: 85-105 BPM
      setHr((prev) => {
        const jitter = Math.round((Math.random() - 0.5) * 8); // -4..+4
        return clamp((prev || 93) + jitter, 85, 105);
      });

      // Temperature: 36.0-37.5°C
      setTemp((prev) => {
        const jitter = (Math.random() - 0.5) * 0.4; // -0.2..+0.2
        return clamp(Number(((prev || 36.5) + jitter).toFixed(1)), 36.0, 37.5);
      });

      // Respiration: 15-22 breaths per min
      setResp((prev) => {
        const jitter = Math.round((Math.random() - 0.5) * 4); // -2..+2
        return clamp((prev || 18) + jitter, 15, 22);
      });

      // O2 Saturation: 95-100%
      setO2((prev) => {
        const jitter = Math.round((Math.random() - 0.5) * 2); // -1..+1
        return clamp((prev || 98) + jitter, 95, 100);
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isConnectedBl, heartRate, temperature, respiration, oxygen]);

  const displayHeartRate = isConnectedBl ? hr : heartRate;
  const displayTemperature = isConnectedBl ? temp : temperature;
  const displayRespiration = isConnectedBl ? resp : respiration;
  const displayO2 = isConnectedBl ? o2 : oxygen;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isConnectedBl) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [isConnectedBl]);

  const animatedStyle = useMemo(() => {
    const scale = pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.25],
    });
    const opacity = pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
    });
    return { transform: [{ scale }], opacity };
  }, [pulse]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Real-time Data</Text>
        <Text style={styles.seeAll} onPress={goDetail}>
          See All
        </Text>
      </View>
      <View style={styles.dataContainer}>
        <View style={styles.dataItem}>
          <Animated.View
            style={
              isConnectedBl ? [styles.iconWrap, animatedStyle] : styles.iconWrap
            }
          >
            <Image
              source={require("../../../assets/home-parent/heart.png")}
              style={styles.icon}
            />
          </Animated.View>
          <Text style={styles.dataText}>{formatValue(displayHeartRate)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.dataItem}>
          <Image
            source={require("../../../assets/home-parent/thermometer.png")}
            width={16}
            height={16}
          />
          <Text style={styles.dataText}>{formatValue(displayTemperature)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.dataItem}>
          <Image
            source={require("../../../assets/home-parent/lungs.png")}
            width={16}
            height={16}
          />
          <Text style={styles.dataText}>{formatValue(displayRespiration)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.dataItem}>
          <Image
            source={require("../../../assets/home-parent/O2.png")}
            width={20}
            height={27}
          />
          <Text style={styles.dataText}>
            {displayO2 !== undefined ? `${displayO2}%` : "-"}
          </Text>
        </View>
      </View>
      <View style={styles.deviceNameContainer}>
        <Image
          source={require("../../../assets/home-parent/bl-device.png")}
          width={12}
          height={16}
        />
        <Text style={styles.deviceName}>
          {deviceName ? deviceName : "No device connected"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E9F8F8",
    borderRadius: 16,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
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
  dataContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DCE3E3",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 6,
  },
  iconWrap: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
  },
  dataText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left",
    marginLeft: 6,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: "#ccc",
  },
  deviceNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  deviceName: {
    marginLeft: 4,
    color: "#999",
    fontSize: 13,
  },
});

export default RealTimeDataWidget;
