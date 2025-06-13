import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

type TabBarButtonProps = {
  icon: ReactNode;
  label: string;
  accessibilityState?: { selected?: boolean };
  onPress: () => void;
  color: string;
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function TabBarButton({ 
  icon, 
  label, 
  accessibilityState, 
  onPress,
  color
}: TabBarButtonProps) {
  const isSelected = accessibilityState?.selected;
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 100, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(1, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    
    onPress();
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  return (
    <AnimatedTouchable
      style={[
        styles.container,
        animatedStyle,
        isSelected && { 
          backgroundColor: color + '20',
          borderBottomColor: color,
          borderBottomWidth: 2
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {icon}
      <Text 
        style={[
          styles.label, 
          { 
            color: isSelected ? color : colors.textSecondary,
            ...(isSelected && { 
              textShadowColor: color,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4 
            })
          }
        ]}
      >
        {label}
      </Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 4,
  },
});