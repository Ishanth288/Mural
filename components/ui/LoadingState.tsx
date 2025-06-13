import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import MuralText from './MuralText';
import MuralLogo from './MuralLogo';
import GlassmorphicCard from './GlassmorphicCard';

interface LoadingStateProps {
  message?: string;
  variant?: 'default' | 'minimal' | 'fullscreen';
  showLogo?: boolean;
}

export default function LoadingState({ 
  message = 'Loading...', 
  variant = 'default',
  showLogo = false 
}: LoadingStateProps) {
  const { colors } = useTheme();
  const pulseAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  
  React.useEffect(() => {
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
    
    rotateAnimation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );
  }, []);
  
  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
    };
  });
  
  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotateAnimation.value}deg` }],
    };
  });
  
  if (variant === 'minimal') {
    return (
      <View style={styles.minimalContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }
  
  if (variant === 'fullscreen') {
    return (
      <View style={[styles.fullscreenContainer, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.logoContainer, pulseStyle]}>
          <MuralLogo size={80} animated={true} />
        </Animated.View>
        <MuralText variant="tagline" style={styles.loadingText}>
          {message}
        </MuralText>
        <View style={styles.progressIndicator}>
          <Animated.View style={[styles.progressDot, rotateStyle]} />
        </View>
      </View>
    );
  }
  
  return (
    <GlassmorphicCard style={styles.defaultContainer}>
      <View style={styles.content}>
        {showLogo && (
          <Animated.View style={[styles.logoContainer, pulseStyle]}>
            <MuralLogo size={40} />
          </Animated.View>
        )}
        <ActivityIndicator 
          size="large" 
          color={colors.primary} 
          style={styles.spinner}
        />
        <MuralText variant="subtitle" style={styles.message}>
          {message}
        </MuralText>
      </View>
    </GlassmorphicCard>
  );
}

// Skeleton loading component for content placeholders
export function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4 
}: { 
  width?: number | string; 
  height?: number; 
  borderRadius?: number; 
}) {
  const { colors } = useTheme();
  const shimmerAnimation = useSharedValue(0);
  
  React.useEffect(() => {
    shimmerAnimation.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);
  
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.3 + (shimmerAnimation.value * 0.4),
    };
  });
  
  return (
    <Animated.View 
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        shimmerStyle
      ]}
    />
  );
}

const styles = StyleSheet.create({
  minimalContainer: {
    padding: 8,
    alignItems: 'center',
  },
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  defaultContainer: {
    margin: 16,
    padding: 24,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginHorizontal: 4,
  },
  skeleton: {
    marginVertical: 4,
  },
});