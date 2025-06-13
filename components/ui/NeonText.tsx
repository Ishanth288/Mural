import React from 'react';
import { Text, StyleSheet, TextStyle, View, Platform } from 'react-native';

interface NeonTextProps {
  text: string;
  color: string;
  glowColor?: string;
  fontSize?: number;
  style?: TextStyle;
}

export default function NeonText({ 
  text, 
  color, 
  glowColor, 
  fontSize = 24, 
  style 
}: NeonTextProps) {
  const actualGlowColor = glowColor || color;
  
  // Create text shadow for glow effect
  const createTextShadow = () => {
    if (Platform.OS !== 'web') {
      return {
        textShadowColor: actualGlowColor,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
      };
    }
    
    // For web, we can use more advanced shadow effects
    return {};
  };
  
  const textStyles = {
    color,
    fontSize,
    ...createTextShadow(),
    ...style,
  };
  
  if (Platform.OS === 'web') {
    // For web, we can use CSS text-shadow for a better glow effect
    return (
      <Text
        style={[
          textStyles,
          {
            // @ts-ignore - Web-specific style
            textShadow: `0 0 5px ${actualGlowColor}, 0 0 10px ${actualGlowColor}, 0 0 15px ${actualGlowColor}`,
          },
        ]}
      >
        {text}
      </Text>
    );
  }
  
  return (
    <View>
      {/* Native platforms get multiple shadow layers for better glow */}
      <Text style={[textStyles, { position: 'absolute', opacity: 0.3 }]}>
        {text}
      </Text>
      <Text style={[textStyles, { position: 'absolute', opacity: 0.5 }]}>
        {text}
      </Text>
      <Text style={textStyles}>{text}</Text>
    </View>
  );
}