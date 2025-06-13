import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { MessageCircle, Heart, Share2, Settings, Grid2x2 as Grid, Map, Award } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { userProfile, userArtworks } from '@/data/mockData';
import ArtCard from '@/components/cards/ArtCard';
import StatisticItem from '@/components/profile/StatisticItem';
import ProfileTabButton from '@/components/profile/ProfileTabButton';
import GlassmorphicCard from '@/components/ui/GlassmorphicCard';
import BadgeItem from '@/components/profile/BadgeItem';
import MuralText from '@/components/ui/MuralText';
import MuralLogo from '@/components/ui/MuralLogo';
import MuralButton from '@/components/ui/MuralButton';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const HEADER_HEIGHT = 280;
const { width } = Dimensions.get('window');

type ProfileTab = 'artworks' | 'map' | 'achievements';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('artworks');
  const { colors } = useTheme();
  const scrollY = useSharedValue(0);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - 100],
      [1, 0],
      Extrapolation.CLAMP
    );
    
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - 100],
      [0, -50],
      Extrapolation.CLAMP
    );
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });
  
  const profileImageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - 100],
      [1, 0.7],
      Extrapolation.CLAMP
    );
    
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - 100],
      [0, -20],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [
        { scale },
        { translateY }
      ],
    };
  });
  
  const compactHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_HEIGHT - 120, HEADER_HEIGHT - 100],
      [0, 1],
      Extrapolation.CLAMP
    );
    
    return {
      opacity,
    };
  });
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'artworks':
        return (
          <View style={styles.artworksContainer}>
            {userArtworks.map((artwork) => (
              <TouchableOpacity 
                key={artwork.id} 
                style={styles.artworkItem}
                activeOpacity={0.9}
              >
                <Image 
                  source={{ uri: artwork.imageUrl }} 
                  style={styles.artworkImage}
                  resizeMode="cover"
                />
                <View style={styles.artworkOverlay}>
                  <MuralText variant="subtitle" style={styles.artworkTitle}>
                    {artwork.title}
                  </MuralText>
                  <View style={styles.artworkStats}>
                    <View style={styles.statItem}>
                      <Heart size={14} color={colors.primary} />
                      <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        {artwork.likes}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <MessageCircle size={14} color={colors.secondary} />
                      <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        {artwork.comments}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Mural watermark on artwork */}
                  <View style={styles.artworkWatermark}>
                    <MuralLogo size={12} color="rgba(255, 255, 255, 0.4)" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'map':
        return (
          <View style={styles.mapPlaceholder}>
            <MuralLogo size={48} color={colors.textMuted} />
            <MuralText variant="tagline" style={styles.mapPlaceholderText}>
              Your mural locations will appear here
            </MuralText>
          </View>
        );
      case 'achievements':
        return (
          <View style={styles.achievementsContainer}>
            <BadgeItem 
              title="Mural Pioneer" 
              description="Joined during Mural's beta phase"
              icon={<Award size={24} color={colors.primary} />}
              color={colors.primary}
              earned
            />
            <BadgeItem 
              title="First Creation" 
              description="Created your first AR mural"
              icon={<Award size={24} color={colors.secondary} />}
              color={colors.secondary}
              earned
            />
            <BadgeItem 
              title="Featured Artist" 
              description="Had your mural featured on Discover"
              icon={<Award size={24} color={colors.accent} />}
              color={colors.accent}
              earned
            />
            <BadgeItem 
              title="Collaboration Master" 
              description="Collaborated on 5+ murals with other artists"
              icon={<Award size={24} color={colors.warning} />}
              color={colors.warning}
            />
            <BadgeItem 
              title="Global Canvas" 
              description="Have murals viewed in 10+ countries"
              icon={<Award size={24} color={colors.success} />}
              color={colors.success}
            />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Compact Header (appears on scroll) */}
      <Animated.View style={[styles.compactHeader, compactHeaderStyle]}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: `${colors.background}90` }]} />
        </BlurView>
        <View style={styles.compactHeaderContent}>
          <MuralLogo size={20} />
          <MuralText variant="tagline" style={styles.compactHeaderTitle}>
            {userProfile.username}
          </MuralText>
        </View>
      </Animated.View>
      
      <AnimatedScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Profile Header */}
        <Animated.View style={[styles.profileHeader, headerStyle]}>
          <LinearGradient
            colors={[colors.accent, colors.primary]}
            style={styles.headerBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Mural branding in header */}
          <View style={styles.headerBrand}>
            <MuralLogo size={24} color="rgba(255, 255, 255, 0.8)" />
          </View>
          
          <Animated.View style={[styles.profileImageContainer, profileImageStyle]}>
            <Image
              source={{ uri: userProfile.profileImage }}
              style={styles.profileImage}
            />
          </Animated.View>
          
          <MuralText variant="logo" style={styles.username}>
            {userProfile.username}
          </MuralText>
          <MuralText variant="subtitle" style={styles.bio}>
            {userProfile.bio}
          </MuralText>
          
          <View style={styles.statsContainer}>
            <StatisticItem 
              label="Murals" 
              value={userProfile.stats.artworks} 
            />
            <StatisticItem 
              label="Followers" 
              value={userProfile.stats.followers} 
            />
            <StatisticItem 
              label="Following" 
              value={userProfile.stats.following} 
            />
          </View>
          
          <View style={styles.actionsContainer}>
            <MuralButton
              title="Follow"
              onPress={() => {}}
              variant="primary"
              size="small"
            />
            <TouchableOpacity 
              style={[styles.actionIconButton, { backgroundColor: colors.card }]}
            >
              <MessageCircle size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionIconButton, { backgroundColor: colors.card }]}
            >
              <Share2 size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        {/* Profile Tabs */}
        <View style={styles.tabsContainer}>
          <GlassmorphicCard style={styles.tabs}>
            <ProfileTabButton
              icon={<Grid size={20} />}
              label="Murals"
              isActive={activeTab === 'artworks'}
              onPress={() => setActiveTab('artworks')}
              activeColor={colors.primary}
            />
            <ProfileTabButton
              icon={<Map size={20} />}
              label="Map"
              isActive={activeTab === 'map'}
              onPress={() => setActiveTab('map')}
              activeColor={colors.secondary}
            />
            <ProfileTabButton
              icon={<Award size={20} />}
              label="Badges"
              isActive={activeTab === 'achievements'}
              onPress={() => setActiveTab('achievements')}
              activeColor={colors.accent}
            />
          </GlassmorphicCard>
        </View>
        
        {/* Tab Content */}
        {renderTabContent()}
        
        {/* Bottom padding for tab bar */}
        <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    height: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  headerBrand: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  username: {
    fontSize: 24,
    color: 'white',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactHeaderTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
  },
  artworksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  artworkItem: {
    width: (width - 48) / 2,
    height: (width - 48) / 2,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  artworkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  artworkTitle: {
    fontSize: 12,
    marginBottom: 4,
    color: 'white',
  },
  artworkStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  statText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    marginLeft: 2,
  },
  artworkWatermark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  mapPlaceholder: {
    height: 300,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.6,
  },
  achievementsContainer: {
    paddingHorizontal: 16,
  },
});