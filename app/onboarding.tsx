import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  FlatList,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolateColor 
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import MuralButton from '@/components/ui/MuralButton';
import MuralText from '@/components/ui/MuralText';
import MuralLogo from '@/components/ui/MuralLogo';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Transform Any Wall',
    description: 'Use AR technology to create stunning digital murals on real-world surfaces without any physical materials.',
    image: 'https://images.pexels.com/photos/1644616/pexels-photo-1644616.jpeg'
  },
  {
    id: '2',
    title: 'Discover Street Art',
    description: 'Explore and experience AR murals created by artists in your neighborhood and around the world.',
    image: 'https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg'
  },
  {
    id: '3',
    title: 'Your City is Your Canvas',
    description: 'Join a global community of digital street artists and make your mark on the urban landscape.',
    image: 'https://images.pexels.com/photos/3052360/pexels-photo-3052360.jpeg'
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [colors.primary, colors.secondary, colors.accent]
    );

    return {
      backgroundColor
    };
  });

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true
      });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const updateCurrentIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      progress.value = withTiming(newIndex / (onboardingData.length - 1));
    }
  };

  const renderItem = ({ item }: { item: typeof onboardingData[0] }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          
          {/* Mural logo overlay */}
          <View style={styles.logoOverlay}>
            <MuralLogo size={40} color="rgba(255, 255, 255, 0.8)" />
          </View>
        </View>
        
        <View style={styles.content}>
          <MuralText variant="logo" style={styles.title}>
            {item.title}
          </MuralText>
          <MuralText variant="subtitle" style={styles.description}>
            {item.description}
          </MuralText>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateCurrentIndex}
      />
      
      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                { 
                  backgroundColor: index === currentIndex 
                    ? colors.primary 
                    : colors.border,
                  width: index === currentIndex ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <MuralText variant="tagline" style={{ color: colors.textSecondary }}>
              Skip
            </MuralText>
          </TouchableOpacity>
          
          <MuralButton
            title={currentIndex === onboardingData.length - 1 ? "Start Creating" : "Next"}
            onPress={handleNext}
            variant={currentIndex === 0 ? 'primary' : currentIndex === 1 ? 'secondary' : 'outline'}
            size="medium"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  imageContainer: {
    height: height * 0.6,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  logoOverlay: {
    position: 'absolute',
    top: 60,
    right: 24,
  },
  content: {
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    alignItems: 'center',
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transition: 'all 0.3s ease',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 16,
  },
});