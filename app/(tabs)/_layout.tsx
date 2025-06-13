import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chrome as Home, Paintbrush as PaintBrush, Compass, User, Settings } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import TabBarButton from '@/components/navigation/TabBarButton';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  return (
    <ErrorBoundary>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            elevation: 0,
            borderTopWidth: 0,
            backgroundColor: 'transparent',
          },
          tabBarBackground: () => (
            <BlurView 
              intensity={80} 
              tint="dark" 
              style={StyleSheet.absoluteFill}
            >
              <View style={[
                StyleSheet.absoluteFill, 
                { backgroundColor: 'rgba(18, 18, 18, 0.75)' }
              ]} />
            </BlurView>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarLabel: 'Home',
            tabBarButton: (props) => (
              <TabBarButton 
                {...props} 
                icon={<Home color={props.accessibilityState?.selected ? colors.primary : colors.text} size={24} />} 
                label="Home"
                color={colors.primary}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarLabel: 'Create',
            tabBarButton: (props) => (
              <TabBarButton 
                {...props} 
                icon={<PaintBrush color={props.accessibilityState?.selected ? colors.secondary : colors.text} size={24} />} 
                label="Create"
                color={colors.secondary}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarLabel: 'Discover',
            tabBarButton: (props) => (
              <TabBarButton 
                {...props} 
                icon={<Compass color={props.accessibilityState?.selected ? colors.accent : colors.text} size={24} />} 
                label="Discover"
                color={colors.accent}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarLabel: 'Profile',
            tabBarButton: (props) => (
              <TabBarButton 
                {...props} 
                icon={<User color={props.accessibilityState?.selected ? colors.success : colors.text} size={24} />} 
                label="Profile"
                color={colors.success}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarLabel: 'Settings',
            tabBarButton: (props) => (
              <TabBarButton 
                {...props} 
                icon={<Settings color={props.accessibilityState?.selected ? colors.warning : colors.text} size={24} />} 
                label="Settings"
                color={colors.warning}
              />
            ),
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
}