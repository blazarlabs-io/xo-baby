import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Svg, Circle } from 'react-native-svg';

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export default function VitalStatsDisplay() {
  const [o2Saturation, setO2Saturation] = useState<number>(98);
  const [breaths, setBreaths] = useState<number>(18);
  const [movement, setMovement] = useState<number>(12);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // O2 Saturation: 95-100%
      setO2Saturation((prev) => {
        const jitter = Math.round((Math.random() - 0.5) * 2); // -1..+1
        return clamp((prev || 98) + jitter, 95, 100);
      });

      // Breaths: 15-22 breaths per min
      setBreaths((prev) => {
        const jitter = Math.round((Math.random() - 0.5) * 4); // -2..+2
        return clamp((prev || 18) + jitter, 15, 22);
      });

      // Movement: 8-16 movement rate
      setMovement((prev) => {
        const jitter = Math.round((Math.random() - 0.5) * 4); // -2..+2
        return clamp((prev || 12) + jitter, 8, 16);
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, []);
  const circleRadius = 68;
  const strokeWidth = 16;
  const center = 82;
  const circumference = 2 * Math.PI * circleRadius;
  const progress = (o2Saturation / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={styles.o2Container}>
        <Svg width={164} height={164}>
          <Circle
            cx={center}
            cy={center}
            r={circleRadius}
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={circleRadius}
            stroke="#31CECE"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center},${center}`}
          />
        </Svg>
        <View style={styles.o2CenterText}>
          <Text style={styles.o2Value}>{o2Saturation}%</Text>
          <Text style={styles.o2Label}>O₂ Saturation</Text>
        </View>
      </View>

      <View style={styles.statsColumn}>
        <View style={styles.statBox}>
          <View style={styles.statTopRow}>
            <Image source={require('../../../assets/home-parent/lungs.png')} style={styles.statIcon} />
            <Text style={styles.statValue}>{breaths}</Text>
          </View>
          <Text style={styles.statLabel}>Breaths per min</Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.statTopRow}>
            <Image source={require('../../../assets/home-parent/runer.png')} style={styles.statIcon} />
            <Text style={styles.statValue}>{movement}</Text>
          </View>
          <Text style={styles.statLabel}>Movement Rate</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 32,
  },
  o2Container: {
    width: 164,
    height: 164,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  o2CenterText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  o2Value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222128',
  },
  o2Label: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#8d8d8d',
    textAlign: 'left',
  },
  statsColumn: {
    gap: 16,
  },
  statBox: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: 164,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '500',
    fontFamily: 'Poppins',
    color: '#222128',
    letterSpacing: 0.48,
    height: 32,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: '#8D8D8D',
    letterSpacing: 0.18,
    marginTop: 4,
  },
});