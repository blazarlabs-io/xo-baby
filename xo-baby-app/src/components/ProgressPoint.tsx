import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressPointProps {
  activeCount: number;
  maxCount: number;
}

export default function ProgressPoint({ activeCount, maxCount }: ProgressPointProps) {
  const points = Array.from({ length: maxCount }, (_, index) => (
    <View
      key={index}
      style={index < activeCount ? styles.progressPointActive : styles.progressPoint}
    />
  ));

  return (
    <View style={styles.wrapper}>
      <View style={styles.progressContainer}>{points}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    gap: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPointActive: {
    width: 12,
    height: 12,
    borderRadius: 50,
    backgroundColor: '#31CECE',
  },
  progressPoint: {
    width: 12,
    height: 12,
    borderRadius: 50,
    backgroundColor: '#CACACA',
  },
});
