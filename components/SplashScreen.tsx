import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import MuralLogo from './ui/MuralLogo';
import MuralText from './ui/MuralText';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { colors } = useTheme();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Logo animation
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    
    // Text animations with delays
    textOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    taglineOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
  }, []);
  
  const logoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    };
  });
  
  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: (1 - textOpacity.value) * 20 }],
    };
  });
  
  const taglineStyle = useAnimatedStyle(() => {
    return {
      opacity: taglineOpacity.value,
      transform: [{ translateY: (1 - taglineOpacity.value) * 20 }],
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, 'rgba(0, 0, 0, 0.9)', colors.background]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <MuralLogo size={120} animated={true} />
        </Animated.View>
        
        <Animated.View style={textStyle}>
          <MuralText variant="logo" style={styles.appTitle}>
            Mural
          </MuralText>
        </Animated.View>
        
        <Animated.View style={taglineStyle}>
          <MuralText variant="tagline" style={styles.tagline}>
            Paint the Streets Digitally
          </MuralText>
        </Animated.View>
      </View>
      
      {/* Subtle brand elements */}
      <View style={styles.brandElements}>
        <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
        <View style={[styles.brandDot, { backgroundColor: colors.secondary }]} />
        <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  appTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
  },
  brandElements: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});