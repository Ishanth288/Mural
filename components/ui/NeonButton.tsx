import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  Dimensions
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

type NeonButtonProps = {
  title: string;
  onPress: () => void;
  color: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function NeonButton({ 
  title, 
  onPress, 
  color, 
  style, 
  textStyle, 
  disabled = false 
}: NeonButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(1, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0.6, { duration: 300 })
    );
    
    onPress();
  };
  
  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });
  
  return (
    <AnimatedTouchable
      onPress={handlePress}
      style={[buttonStyle, style]}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <AnimatedLinearGradient
        colors={[color, color + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, { borderColor: color + '50' }]}
      >
        <Text style={[styles.text, textStyle]}>
          {title}
        </Text>
        
        <AnimatedLinearGradient
          colors={[color + '00', color, color + '00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.glow, glowStyle]}
        />
      </AnimatedLinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 30,
  },
});