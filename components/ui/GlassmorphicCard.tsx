import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';

type GlassmorphicCardProps = {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: number;
  variant?: 'default' | 'strong';
};

export default function GlassmorphicCard({ 
  children, 
  style, 
  intensity = 50,
  variant = 'default'
}: GlassmorphicCardProps) {
  const { colors } = useTheme();
  
  if (Platform.OS === 'web') {
    return (
      <View 
        style={[
          styles.container, 
          { 
            backgroundColor: variant === 'strong' ? colors.glassStrong : colors.glass,
            borderColor: colors.glassBorder,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
          },
          style
        ]}
      >
        {children}
      </View>
    );
  }
  
  return (
    <View style={[styles.container, style]}>
      <BlurView 
        intensity={intensity} 
        tint="dark" 
        style={StyleSheet.absoluteFill}
      >
        <View 
          style={[
            StyleSheet.absoluteFill, 
            { 
              backgroundColor: variant === 'strong' ? colors.glassStrong : colors.glass,
              borderColor: colors.glassBorder,
            }
          ]} 
        />
      </BlurView>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 16,
  },
});