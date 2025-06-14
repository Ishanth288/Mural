import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  View
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import AccessibilityWrapper from './AccessibilityWrapper';

type MuralButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MuralButton({ 
  title, 
  onPress, 
  variant = 'primary',
  size = 'medium',
  style, 
  textStyle, 
  disabled = false,
  icon,
  loading = false,
  accessibilityLabel,
  accessibilityHint
}: MuralButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  
  const handlePress = () => {
    if (disabled || loading) return;
    
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
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 16,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 28,
          minHeight: 56,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 24,
          minHeight: 44, // Accessibility: minimum touch target
        };
    }
  };
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 2,
        };
      case 'ghost':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'transparent',
        };
      case 'primary':
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
    }
  };
  
  const getTextColor = () => {
    if (variant === 'outline') return colors.primary;
    return '#FFFFFF';
  };
  
  const getFontSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 18;
      case 'medium':
      default: return 16;
    }
  };
  
  return (
    <AccessibilityWrapper
      label={accessibilityLabel || title}
      hint={accessibilityHint}
      role="button"
      state={{ disabled: disabled || loading }}
    >
      <AnimatedPressable
        onPress={handlePress}
        style={[buttonStyle, style]}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading }}
      >
        <View style={[
          styles.button,
          getSizeStyles(),
          getVariantStyles(),
          (disabled || loading) && styles.disabled
        ]}>
          <View style={styles.content}>
            {icon && !loading && <View style={styles.icon}>{icon}</View>}
            {loading && (
              <View style={styles.loadingIndicator}>
                <Text style={styles.loadingText}>...</Text>
              </View>
            )}
            <Text style={[
              styles.text,
              { 
                color: getTextColor(),
                fontSize: getFontSize()
              },
              textStyle
            ]}>
              {title}
            </Text>
          </View>
          
          {/* Mural brand accent */}
          <View style={[styles.brandAccent, { backgroundColor: colors.accent }]} />
        </View>
      </AnimatedPressable>
    </AccessibilityWrapper>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  text: {
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
  brandAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});