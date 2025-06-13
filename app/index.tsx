import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet } from 'react-native';
import SplashScreenComponent from '@/components/SplashScreen';
import { useState } from 'react';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if this is the first app launch
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        setIsFirstLaunch(hasLaunched === null);
        
        // Set timeout to simulate loading
        setTimeout(() => {
          setIsLoading(false);
          SplashScreen.hideAsync();
        }, 2000);
        
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstLaunch(false);
        setIsLoading(false);
        SplashScreen.hideAsync();
      }
    };

    checkFirstLaunch();
  }, []);

  // Show custom splash screen during loading
  if (isLoading) {
    return <SplashScreenComponent />;
  }

  // Redirect to onboarding for first-time users, otherwise go to main app
  if (isFirstLaunch === true) {
    return <Redirect href="/onboarding" />;
  } else {
    return <Redirect href="/(tabs)" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});