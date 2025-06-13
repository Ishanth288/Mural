import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import MuralText from './MuralText';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  variant?: 'linear' | 'circular' | 'stepped';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
  steps?: string[];
  currentStep?: number;
  animated?: boolean;
}

export default function ProgressIndicator({
  progress,
  variant = 'linear',
  size = 'medium',
  color,
  backgroundColor,
  showPercentage = false,
  label,
  steps,
  currentStep = 0,
  animated = true
}: ProgressIndicatorProps) {
  const { colors } = useTheme();
  const progressColor = color || colors.primary;
  const bgColor = backgroundColor || colors.border;
  
  const animatedProgress = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedProgress.setValue(progress);
    }
  }, [progress, animated]);
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: 4, borderRadius: 2 };
      case 'large':
        return { height: 12, borderRadius: 6 };
      case 'medium':
      default:
        return { height: 8, borderRadius: 4 };
    }
  };
  
  if (variant === 'stepped' && steps) {
    return (
      <View style={styles.steppedContainer}>
        {label && (
          <MuralText variant="subtitle" style={[styles.label, { color: colors.text }]}>
            {label}
          </MuralText>
        )}
        
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <View key={index} style={styles.stepContainer}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: isCompleted || isCurrent ? progressColor : bgColor,
                      borderColor: isCurrent ? progressColor : 'transparent',
                      borderWidth: isCurrent ? 2 : 0,
                    }
                  ]}
                >
                  {isCompleted && (
                    <MuralText variant="subtitle" style={styles.stepNumber}>
                      ✓
                    </MuralText>
                  )}
                  {isCurrent && !isCompleted && (
                    <MuralText variant="subtitle" style={[styles.stepNumber, { color: 'white' }]}>
                      {index + 1}
                    </MuralText>
                  )}
                  {!isCompleted && !isCurrent && (
                    <MuralText variant="subtitle" style={[styles.stepNumber, { color: colors.textMuted }]}>
                      {index + 1}
                    </MuralText>
                  )}
                </View>
                
                <MuralText 
                  variant="subtitle" 
                  style={[
                    styles.stepLabel,
                    { color: isCompleted || isCurrent ? colors.text : colors.textMuted }
                  ]}
                >
                  {step}
                </MuralText>
                
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      { backgroundColor: isCompleted ? progressColor : bgColor }
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  }
  
  if (variant === 'circular') {
    const radius = size === 'small' ? 20 : size === 'large' ? 40 : 30;
    const strokeWidth = size === 'small' ? 3 : size === 'large' ? 6 : 4;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return (
      <View style={[styles.circularContainer, { width: radius * 2 + 20, height: radius * 2 + 20 }]}>
        <svg width={radius * 2 + 20} height={radius * 2 + 20} style={styles.circularSvg}>
          {/* Background circle */}
          <circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius + 10} ${radius + 10})`}
            style={{
              transition: animated ? 'stroke-dashoffset 0.5s ease' : 'none'
            }}
          />
        </svg>
        
        {showPercentage && (
          <View style={styles.circularText}>
            <MuralText variant="tagline" style={[styles.percentage, { color: colors.text }]}>
              {Math.round(progress)}%
            </MuralText>
          </View>
        )}
        
        {label && (
          <MuralText variant="subtitle" style={[styles.circularLabel, { color: colors.text }]}>
            {label}
          </MuralText>
        )}
      </View>
    );
  }
  
  // Linear progress bar
  return (
    <View style={styles.linearContainer}>
      {label && (
        <View style={styles.labelContainer}>
          <MuralText variant="subtitle" style={[styles.label, { color: colors.text }]}>
            {label}
          </MuralText>
          {showPercentage && (
            <MuralText variant="subtitle" style={[styles.percentage, { color: colors.text }]}>
              {Math.round(progress)}%
            </MuralText>
          )}
        </View>
      )}
      
      <View style={[styles.progressBar, getSizeStyles(), { backgroundColor: bgColor }]}>
        <Animated.View
          style={[
            styles.progressFill,
            getSizeStyles(),
            {
              width: animatedProgress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            }
          ]}
        >
          <LinearGradient
            colors={[progressColor, progressColor + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, getSizeStyles()]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linearContainer: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circularSvg: {
    position: 'absolute',
  },
  circularText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularLabel: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  steppedContainer: {
    width: '100%',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 80,
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    zIndex: -1,
  },
});