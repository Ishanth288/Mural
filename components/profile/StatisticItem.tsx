import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type StatisticItemProps = {
  label: string;
  value: number | string;
};

export default function StatisticItem({ label, value }: StatisticItemProps) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.value, { color: 'white' }]}>
        {typeof value === 'number' && value > 999 
          ? `${(value / 1000).toFixed(1)}k` 
          : value}
      </Text>
      <Text style={[styles.label, { color: 'rgba(255, 255, 255, 0.7)' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  value: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});