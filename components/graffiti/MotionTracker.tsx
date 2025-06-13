import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  interpolate
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import MuralText from '../ui/MuralText';

interface MotionData {
  acceleration: { x: number; y: number; z: number };
  rotation: { alpha: number; beta: number; gamma: number };
  timestamp: number;
  pressure: number;
  distance: number;
}

interface MotionTrackerProps {
  motionData: MotionData | null;
  isActive: boolean;
  onMotionUpdate: (data: MotionData) => void;
}

export default function MotionTracker({
  motionData,
  isActive,
  onMotionUpdate
}: MotionTrackerProps) {
  const { colors } = useTheme();
  
  const handX = useSharedValue(0);
  const handY = useSharedValue(0);
  const motionIntensity = useSharedValue(0);
  const trackingAccuracy = useSharedValue(0.8);
  
  React.useEffect(() => {
    if (!motionData || !isActive) return;
    
    handX.value = withSpring(motionData.acceleration.x * 50, {
      damping: 15,
      stiffness: 150,
    });
    
    handY.value = withSpring(motionData.acceleration.y * 50, {
      damping: 15,
      stiffness: 150,
    });
    
    const intensity = Math.sqrt(
      motionData.acceleration.x ** 2 + 
      motionData.acceleration.y ** 2 + 
      motionData.acceleration.z ** 2
    );
    motionIntensity.value = withSpring(Math.min(1, intensity / 3));
  }, [motionData, isActive]);
  
  const motionIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: handX.value },
        { translateY: handY.value },
      ],
      opacity: motionIntensity.value,
    };
  });
  
  const accuracyIndicatorStyle = useAnimatedStyle(() => {
    const color = interpolate(
      trackingAccuracy.value,
      [0, 0.5, 1],
      [0, 0.5, 1]
    );
    
    return {
      backgroundColor: `rgba(${255 * (1 - color)}, ${255 * color}, 0, 0.8)`,
      transform: [{ scale: trackingAccuracy.value }]
    };
  });

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      {/* Motion Crosshair */}
      <Animated.View style={[styles.motionCrosshair, motionIndicatorStyle]}>
        <View style={styles.crosshairHorizontal} />
        <View style={styles.crosshairVertical} />
        <View style={[styles.crosshairCenter, { backgroundColor: colors.primary }]} />
      </Animated.View>
      
      {/* Tracking Accuracy Indicator */}
      <View style={styles.accuracyContainer}>
        <Animated.View style={[styles.accuracyIndicator, accuracyIndicatorStyle]} />
        <MuralText variant="subtitle" style={styles.accuracyText}>
          Tracking: {Math.round((trackingAccuracy.value || 0) * 100)}%
        </MuralText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  motionCrosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginTop: -20,
    marginLeft: -20,
  },
  crosshairHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginTop: -0.5,
  },
  crosshairVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginLeft: -0.5,
  },
  crosshairCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: -3,
    marginLeft: -3,
  },
  accuracyContainer: {
    position: 'absolute',
    top: 80,
    right: 16,
    alignItems: 'center',
  },
  accuracyIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});