import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

type MuralLogoProps = {
  size?: number;
  variant?: 'full' | 'icon' | 'horizontal';
  animated?: boolean;
  color?: string;
};

export default function MuralLogo({ 
  size = 60, 
  variant = 'icon', 
  animated = false,
  color 
}: MuralLogoProps) {
  const { colors } = useTheme();
  const logoColor = color || colors.primary;
  
  const brick1 = useSharedValue(0);
  const brick2 = useSharedValue(0);
  const brick3 = useSharedValue(0);
  const brick4 = useSharedValue(0);
  const brick5 = useSharedValue(0);
  const brick6 = useSharedValue(0);
  
  React.useEffect(() => {
    if (animated) {
      // Animate bricks building up to form the M
      brick1.value = withDelay(0, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
      brick2.value = withDelay(100, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
      brick3.value = withDelay(200, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
      brick4.value = withDelay(300, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
      brick5.value = withDelay(400, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
      brick6.value = withDelay(500, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
    } else {
      brick1.value = 1;
      brick2.value = 1;
      brick3.value = 1;
      brick4.value = 1;
      brick5.value = 1;
      brick6.value = 1;
    }
  }, [animated]);
  
  const createBrickStyle = (brickValue: Animated.SharedValue<number>) => {
    return useAnimatedStyle(() => {
      return {
        opacity: brickValue.value,
        transform: [
          { scale: brickValue.value },
          { translateY: (1 - brickValue.value) * 20 }
        ],
      };
    });
  };
  
  const brick1Style = createBrickStyle(brick1);
  const brick2Style = createBrickStyle(brick2);
  const brick3Style = createBrickStyle(brick3);
  const brick4Style = createBrickStyle(brick4);
  const brick5Style = createBrickStyle(brick5);
  const brick6Style = createBrickStyle(brick6);
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Left pillar of M */}
      <Animated.View style={[styles.brick, styles.leftPillar1, { backgroundColor: logoColor }, brick1Style]} />
      <Animated.View style={[styles.brick, styles.leftPillar2, { backgroundColor: logoColor }, brick2Style]} />
      
      {/* Center diagonal */}
      <Animated.View style={[styles.brick, styles.centerDiagonal1, { backgroundColor: logoColor }, brick3Style]} />
      <Animated.View style={[styles.brick, styles.centerDiagonal2, { backgroundColor: logoColor }, brick4Style]} />
      
      {/* Right pillar of M */}
      <Animated.View style={[styles.brick, styles.rightPillar1, { backgroundColor: logoColor }, brick5Style]} />
      <Animated.View style={[styles.brick, styles.rightPillar2, { backgroundColor: logoColor }, brick6Style]} />
      
      {/* Subtle texture overlay */}
      <View style={[styles.textureOverlay, { width: size, height: size }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brick: {
    position: 'absolute',
    borderRadius: 2,
  },
  // Left pillar
  leftPillar1: {
    width: 8,
    height: 35,
    left: 8,
    top: 8,
  },
  leftPillar2: {
    width: 8,
    height: 35,
    left: 8,
    bottom: 8,
  },
  // Center diagonal
  centerDiagonal1: {
    width: 6,
    height: 20,
    left: 20,
    top: 15,
    transform: [{ rotate: '25deg' }],
  },
  centerDiagonal2: {
    width: 6,
    height: 20,
    right: 20,
    top: 15,
    transform: [{ rotate: '-25deg' }],
  },
  // Right pillar
  rightPillar1: {
    width: 8,
    height: 35,
    right: 8,
    top: 8,
  },
  rightPillar2: {
    width: 8,
    height: 35,
    right: 8,
    bottom: 8,
  },
  textureOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
  },
});