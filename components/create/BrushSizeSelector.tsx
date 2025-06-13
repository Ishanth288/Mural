import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 80;
const THUMB_SIZE = 24;
const MIN_SIZE = 1;
const MAX_SIZE = 30;

type BrushSizeSelectorProps = {
  size: number;
  onSizeChange: (size: number) => void;
  onClose: () => void;
};

export default function BrushSizeSelector({ 
  size, 
  onSizeChange, 
  onClose 
}: BrushSizeSelectorProps) {
  const { colors } = useTheme();
  
  // Calculate initial position based on size
  const initialPosition = ((size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * SLIDER_WIDTH;
  const position = useSharedValue(initialPosition);
  
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = position.value;
    },
    onActive: (event, ctx) => {
      position.value = Math.max(
        0,
        Math.min(SLIDER_WIDTH, ctx.startX + event.translationX)
      );
      
      const newSize = Math.round(
        MIN_SIZE + (position.value / SLIDER_WIDTH) * (MAX_SIZE - MIN_SIZE)
      );
      
      // This is a workaround for react-native-reanimated's limitation
      // You can't directly call JavaScript functions from worklets
      // We'll update the size in the UI thread
      runOnJS(onSizeChange)(newSize);
    },
  });
  
  function runOnJS(fn: Function) {
    'worklet';
    return fn;
  }
  
  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: position.value }],
    };
  });
  
  const trackFilledStyle = useAnimatedStyle(() => {
    return {
      width: position.value + THUMB_SIZE / 2,
    };
  });
  
  return (
    <View style={styles.overlay}>
      <GlassmorphicCard style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Brush Size: {size}
        </Text>
        
        <View style={styles.sliderContainer}>
          <View style={[styles.track, { backgroundColor: `${colors.border}50` }]}>
            <Animated.View 
              style={[
                styles.trackFilled, 
                { backgroundColor: colors.primary },
                trackFilledStyle
              ]} 
            />
          </View>
          
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View 
              style={[
                styles.thumb, 
                { backgroundColor: colors.primary },
                thumbStyle
              ]} 
            />
          </PanGestureHandler>
        </View>
        
        <View style={styles.previewContainer}>
          <View 
            style={[
              styles.brushPreview, 
              { 
                width: size * 2, 
                height: size * 2, 
                backgroundColor: colors.primary 
              }
            ]} 
          />
        </View>
        
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.card }]}
          onPress={onClose}
        >
          <Text style={[styles.closeButtonText, { color: colors.text }]}>
            Done
          </Text>
        </TouchableOpacity>
      </GlassmorphicCard>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 180,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  track: {
    height: 4,
    width: SLIDER_WIDTH,
    borderRadius: 2,
    alignSelf: 'center',
  },
  trackFilled: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    position: 'absolute',
    top: -THUMB_SIZE / 2 + 2,
    left: -THUMB_SIZE / 2,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: 16,
  },
  brushPreview: {
    borderRadius: 100,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});