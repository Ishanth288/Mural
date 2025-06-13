import React, { ReactNode } from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle,
  Dimensions
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

type FloatingActionButtonProps = {
  icon: ReactNode;
  onPress: () => void;
  color: string;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function FloatingActionButton({ 
  icon, 
  onPress, 
  color, 
  style, 
  size = 'medium' 
}: FloatingActionButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  
  const getSize = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'large':
        return 60;
      case 'medium':
      default:
        return 50;
    }
  };
  
  const buttonSize = getSize();
  
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 100, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(1, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    
    glowOpacity.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(0.5, { duration: 300 })
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
      style={[
        buttonStyle,
        styles.button,
        { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
        style
      ]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[color, color + '80']}
        style={[
          styles.gradient,
          { 
            width: buttonSize, 
            height: buttonSize, 
            borderRadius: buttonSize / 2,
            borderColor: color + '50' 
          }
        ]}
      >
        {icon}
        
        <AnimatedLinearGradient
          colors={[color + '00', color, color + '00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.glow,
            { 
              width: buttonSize * 1.5, 
              height: buttonSize * 1.5, 
              borderRadius: buttonSize
            },
            glowStyle
          ]}
        />
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  glow: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});