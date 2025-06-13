import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { 
  List, 
  Map, 
  Search, 
  Filter, 
  ChevronUp, 
  ChevronDown,
  TrendingUp,
  Award,
  Users,
  MapPin,
  Calendar
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { artLocations, leaderboardData, challengesData } from '@/data/mockData';
import ArtListItem from '@/components/cards/ArtListItem';
import GlassmorphicCard from '@/components/ui/GlassmorphicCard';
import SearchBar from '@/components/ui/SearchBar';
import InteractiveMap from '@/components/discovery/InteractiveMap';
import MuralText from '@/components/ui/MuralText';
import MuralLogo from '@/components/ui/MuralLogo';
import MuralButton from '@/components/ui/MuralButton';

const { width, height } = Dimensions.get('window');
const BOTTOM_SHEET_MIN_HEIGHT = 150;
const BOTTOM_SHEET_MAX_HEIGHT = height * 0.7;

type DiscoveryTab = 'nearby' | 'trending' | 'challenges' | 'leaderboard';

export default function DiscoverScreen() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeTab, setActiveTab] = useState<DiscoveryTab>('nearby');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { colors } = useTheme();
  
  const translateY = useSharedValue(BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT);
  const isExpanded = useSharedValue(false);
  
  const filteredArtLocations = artLocations.filter(
    (art) => {
      const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           art.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilters.length === 0 || 
                           selectedFilters.includes(art.category);
      return matchesSearch && matchesFilter;
    }
  );
  
  const handleLocationSelect = (location: any) => {
    // Handle location selection
  };
  
  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
  };
  
  const renderNearbyContent = () => (
    <View style={styles.tabContent}>
      {viewMode === 'list' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredArtLocations.map((art) => (
            <ArtListItem
              key={art.id}
              art={art}
              fullWidth
              onPress={() => handleLocationSelect(art)}
            />
          ))}
        </ScrollView>
      ) : (
        <InteractiveMap
          artLocations={filteredArtLocations}
          onLocationSelect={handleLocationSelect}
          onFilterChange={handleFilterChange}
          userLocation={{ latitude: 40.7580, longitude: -73.9855 }}
        />
      )}
    </View>
  );
  
  const renderTrendingContent = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <GlassmorphicCard style={styles.trendingCard}>
        <View style={styles.trendingHeader}>
          <TrendingUp size={24} color={colors.warning} />
          <MuralText variant="tagline" style={styles.trendingTitle}>
            Trending This Week
          </MuralText>
        </View>
        
        {leaderboardData.trendingLocations.map((location, index) => (
          <TouchableOpacity key={location.id} style={styles.trendingItem}>
            <View style={styles.trendingRank}>
              <MuralText variant="tagline" style={styles.rankNumber}>
                #{index + 1}
              </MuralText>
            </View>
            <View style={styles.trendingInfo}>
              <MuralText variant="tagline" style={styles.trendingLocationName}>
                {location.name}
              </MuralText>
              <MuralText variant="subtitle" style={styles.trendingLocationCity}>
                {location.city} • {location.artworkCount} murals
              </MuralText>
            </View>
            <MuralText variant="subtitle" style={styles.trendingViews}>
              {location.totalViews.toLocaleString()} views
            </MuralText>
          </TouchableOpacity>
        ))}
      </GlassmorphicCard>
      
      <GlassmorphicCard style={styles.hotArtistsCard}>
        <View style={styles.hotArtistsHeader}>
          <Award size={24} color={colors.primary} />
          <MuralText variant="tagline" style={styles.hotArtistsTitle}>
            Hot Artists
          </MuralText>
        </View>
        
        {leaderboardData.topArtists.slice(0, 5).map((artist) => (
          <TouchableOpacity key={artist.id} style={styles.artistItem}>
            <View style={styles.artistRank}>
              <MuralText variant="tagline" style={styles.artistRankNumber}>
                #{artist.rank}
              </MuralText>
            </View>
            <View style={styles.artistInfo}>
              <MuralText variant="tagline" style={styles.artistName}>
                {artist.username}
                {artist.isVerified && ' ✓'}
              </MuralText>
              <MuralText variant="subtitle" style={styles.artistStats}>
                {artist.totalLikes.toLocaleString()} likes • {artist.artworkCount} murals
              </MuralText>
            </View>
          </TouchableOpacity>
        ))}
      </GlassmorphicCard>
    </ScrollView>
  );
  
  const renderChallengesContent = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {challengesData.map((challenge) => (
        <GlassmorphicCard key={challenge.id} style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <MuralText variant="tagline" style={styles.challengeTitle}>
              {challenge.title}
            </MuralText>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: challenge.difficulty === 'Easy' ? colors.success : 
                               challenge.difficulty === 'Medium' ? colors.warning : colors.error }
            ]}>
              <MuralText variant="subtitle" style={styles.difficultyText}>
                {challenge.difficulty}
              </MuralText>
            </View>
          </View>
          
          <MuralText variant="subtitle" style={styles.challengeDescription}>
            {challenge.description}
          </MuralText>
          
          <View style={styles.challengeStats}>
            <View style={styles.challengeStat}>
              <Users size={16} color={colors.primary} />
              <MuralText variant="subtitle" style={styles.challengeStatText}>
                {challenge.participants} participants
              </MuralText>
            </View>
            <View style={styles.challengeStat}>
              <Calendar size={16} color={colors.secondary} />
              <MuralText variant="subtitle" style={styles.challengeStatText}>
                Ends {challenge.endDate}
              </MuralText>
            </View>
          </View>
          
          <View style={styles.challengePrize}>
            <MuralText variant="tagline" style={styles.prizeText}>
              Prize: {challenge.prize}
            </MuralText>
          </View>
          
          <MuralButton
            title="Join Challenge"
            onPress={() => {}}
            variant="primary"
            size="medium"
          />
        </GlassmorphicCard>
      ))}
    </ScrollView>
  );
  
  const renderLeaderboardContent = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <GlassmorphicCard style={styles.leaderboardCard}>
        <View style={styles.leaderboardHeader}>
          <Award size={24} color={colors.warning} />
          <MuralText variant="tagline" style={styles.leaderboardTitle}>
            Top Artists This Month
          </MuralText>
        </View>
        
        {leaderboardData.topArtists.map((artist, index) => (
          <TouchableOpacity key={artist.id} style={styles.leaderboardItem}>
            <View style={[
              styles.leaderboardRank,
              { backgroundColor: index === 0 ? colors.warning : 
                               index === 1 ? colors.textSecondary : 
                               index === 2 ? '#CD7F32' : colors.textMuted }
            ]}>
              <MuralText variant="tagline" style={styles.leaderboardRankText}>
                {artist.rank}
              </MuralText>
            </View>
            
            <View style={styles.leaderboardInfo}>
              <MuralText variant="tagline" style={styles.leaderboardName}>
                {artist.username}
                {artist.isVerified && ' ✓'}
              </MuralText>
              <MuralText variant="subtitle" style={styles.leaderboardStats}>
                {artist.totalLikes.toLocaleString()} total likes
              </MuralText>
            </View>
            
            <MuralText variant="subtitle" style={styles.leaderboardArtworks}>
              {artist.artworkCount} murals
            </MuralText>
          </TouchableOpacity>
        ))}
      </GlassmorphicCard>
    </ScrollView>
  );
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'nearby':
        return renderNearbyContent();
      case 'trending':
        return renderTrendingContent();
      case 'challenges':
        return renderChallengesContent();
      case 'leaderboard':
        return renderLeaderboardContent();
      default:
        return renderNearbyContent();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View style={styles.brandHeader}>
          <MuralLogo size={24} />
          <MuralText variant="tagline" style={styles.headerTitle}>
            Discover Murals
          </MuralText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color={colors.text} />
          </TouchableOpacity>
          
          {activeTab === 'nearby' && (
            <TouchableOpacity 
              style={[styles.viewModeButton, { backgroundColor: colors.primary }]}
              onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            >
              {viewMode === 'list' ? (
                <Map size={20} color="white" />
              ) : (
                <List size={20} color="white" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <SearchBar
        placeholder="Search murals, artists, or locations..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={() => {}}
      />
      
      {/* Discovery Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {[
            { id: 'nearby', label: 'Nearby', icon: MapPin },
            { id: 'trending', label: 'Trending', icon: TrendingUp },
            { id: 'challenges', label: 'Challenges', icon: Award },
            { id: 'leaderboard', label: 'Leaderboard', icon: Users },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && { 
                  backgroundColor: colors.primary + '30',
                  borderColor: colors.primary 
                }
              ]}
              onPress={() => setActiveTab(tab.id as DiscoveryTab)}
            >
              <tab.icon 
                size={18} 
                color={activeTab === tab.id ? colors.primary : colors.textSecondary} 
              />
              <MuralText 
                variant="subtitle" 
                style={[
                  styles.tabText,
                  { color: activeTab === tab.id ? colors.primary : colors.textSecondary }
                ]}
              >
                {tab.label}
              </MuralText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Tab Content */}
      {renderTabContent()}
      
      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassmorphicCard style={styles.filterModal}>
            <MuralText variant="logo" style={styles.filterModalTitle}>
              Filter Murals
            </MuralText>
            
            <View style={styles.filterCategories}>
              {['All', 'Graffiti', 'Murals', 'Digital Art', 'Stencils', 'Installations'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterCategory,
                    {
                      backgroundColor: (category === 'All' && selectedFilters.length === 0) || 
                                     selectedFilters.includes(category)
                        ? colors.primary + '30'
                        : 'transparent',
                      borderColor: (category === 'All' && selectedFilters.length === 0) || 
                                  selectedFilters.includes(category)
                        ? colors.primary
                        : colors.border
                    }
                  ]}
                  onPress={() => {
                    if (category === 'All') {
                      setSelectedFilters([]);
                    } else {
                      setSelectedFilters(prev => 
                        prev.includes(category)
                          ? prev.filter(f => f !== category)
                          : [...prev, category]
                      );
                    }
                  }}
                >
                  <MuralText variant="subtitle" style={styles.filterCategoryText}>
                    {category}
                  </MuralText>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.filterModalActions}>
              <MuralButton
                title="Apply Filters"
                onPress={() => setShowFilterModal(false)}
                variant="primary"
                size="medium"
              />
              <TouchableOpacity 
                style={styles.cancelFilterButton}
                onPress={() => setShowFilterModal(false)}
              >
                <MuralText variant="subtitle" style={{ color: colors.textSecondary }}>
                  Cancel
                </MuralText>
              </TouchableOpacity>
            </View>
          </GlassmorphicCard>
        </View>
      </Modal>
      
      {/* Mural branding footer */}
      <View style={styles.brandFooter}>
        <MuralText variant="subtitle" style={styles.footerText}>
          Powered by Mural Community
        </MuralText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    padding: 8,
    marginRight: 8,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
  },
  tabsContainer: {
    paddingVertical: 12,
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  trendingCard: {
    padding: 16,
    marginBottom: 16,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendingTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  trendingRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trendingLocationName: {
    fontSize: 16,
  },
  trendingLocationCity: {
    fontSize: 12,
    opacity: 0.7,
  },
  trendingViews: {
    fontSize: 12,
    opacity: 0.8,
  },
  hotArtistsCard: {
    padding: 16,
    marginBottom: 16,
  },
  hotArtistsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hotArtistsTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  artistRank: {
    width: 40,
    alignItems: 'center',
  },
  artistRankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  artistName: {
    fontSize: 16,
  },
  artistStats: {
    fontSize: 12,
    opacity: 0.7,
  },
  challengeCard: {
    padding: 16,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 18,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
  },
  challengeDescription: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
  },
  challengeStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  challengeStatText: {
    marginLeft: 4,
    fontSize: 12,
  },
  challengePrize: {
    marginBottom: 16,
  },
  prizeText: {
    fontSize: 14,
    color: '#FFD700',
  },
  leaderboardCard: {
    padding: 16,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  leaderboardRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardRankText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
  },
  leaderboardStats: {
    fontSize: 12,
    opacity: 0.7,
  },
  leaderboardArtworks: {
    fontSize: 12,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  filterModal: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
  },
  filterModalTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  filterCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  filterCategory: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  filterCategoryText: {
    fontSize: 14,
  },
  filterModalActions: {
    alignItems: 'center',
  },
  cancelFilterButton: {
    marginTop: 12,
    padding: 8,
  },
  brandFooter: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
  },
});