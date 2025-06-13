import React, { ReactNode } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

type ProfileTabButtonProps = {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onPress: () => void;
  activeColor: string;
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ProfileTabButton({ 
  icon, 
  label, 
  isActive, 
  onPress,
  activeColor
}: ProfileTabButtonProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(isActive ? 1 : 0);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isActive ? 1 : 0, { 
        duration: 200, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      }),
    };
  });
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive && { backgroundColor: `${activeColor}20` }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.indicator, { backgroundColor: activeColor }, animatedStyle]} />
      {React.cloneElement(icon as React.ReactElement, { 
        color: isActive ? activeColor : colors.textSecondary 
      })}
      <Text 
        style={[
          styles.label, 
          { color: isActive ? activeColor : colors.textSecondary }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '40%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 4,
  },
});