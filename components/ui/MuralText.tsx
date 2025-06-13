import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type MuralTextProps = {
  variant?: 'logo' | 'tagline' | 'subtitle';
  style?: TextStyle;
  children: React.ReactNode;
  color?: string;
};

export default function MuralText({ 
  variant = 'logo', 
  style, 
  children, 
  color 
}: MuralTextProps) {
  const { colors } = useTheme();
  const textColor = color || colors.text;
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'logo':
        return {
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: 32,
          letterSpacing: -1,
          color: textColor,
        };
      case 'tagline':
        return {
          fontFamily: 'Inter-Medium',
          fontSize: 16,
          letterSpacing: 0.5,
          color: textColor,
          opacity: 0.9,
        };
      case 'subtitle':
        return {
          fontFamily: 'Inter-Regular',
          fontSize: 14,
          letterSpacing: 0.2,
          color: textColor,
          opacity: 0.7,
        };
      default:
        return {};
    }
  };
  
  return (
    <Text style={[getVariantStyle(), style]}>
      {children}
    </Text>
  );
}