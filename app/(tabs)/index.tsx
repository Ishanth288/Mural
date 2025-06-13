import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  Platform,
  TouchableOpacity,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  interpolate, 
  Extrapolation 
} from 'react-native-reanimated';
import { MapPin, Heart, MessageCircle, Share2, Play } from 'lucide-react-native';
import { nearbyArtData, socialFeedData, commentsData } from '@/data/mockData';
import ArtCard from '@/components/cards/ArtCard';
import ArtFeed from '@/components/social/ArtFeed';
import CommentSystem from '@/components/social/CommentSystem';
import { useTheme } from '@/context/ThemeContext';
import MuralText from '@/components/ui/MuralText';
import MuralLogo from '@/components/ui/MuralLogo';
import MuralButton from '@/components/ui/MuralButton';
import GlassmorphicCard from '@/components/ui/GlassmorphicCard';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import LoadingState from '@/components/ui/LoadingState';
import AccessibilityWrapper from '@/components/ui/AccessibilityWrapper';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

type FeedMode = 'nearby' | 'following' | 'trending';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [feedMode, setFeedMode] = useState<FeedMode>('nearby');
  const [showComments, setShowComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [posts, setPosts] = useState(socialFeedData);
  const [comments, setComments] = useState(commentsData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();
  const scrollY = useSharedValue(0);

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In real app, fetch new data here
    } catch (err) {
      setError('Failed to refresh feed. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 120],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [80, 120],
      [0, 1],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [80, 120],
      [20, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });
  
  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };
  
  const handleComment = (postId: string) => {
    setSelectedPost(postId);
    setShowComments(true);
  };
  
  const handleShare = async (postId: string) => {
    try {
      // Implement share functionality
      console.log('Sharing post:', postId);
    } catch (error) {
      setError('Failed to share post');
    }
  };
  
  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };
  
  const handlePlayTimelapse = (postId: string) => {
    // Implement timelapse video playback
    console.log('Playing timelapse for post:', postId);
  };
  
  const handleAddComment = (text: string, parentId?: string) => {
    const newComment = {
      id: Date.now().toString(),
      user: {
        username: 'You',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        isVerified: false
      },
      text,
      timeAgo: 'now',
      likes: 0,
      isLiked: false,
      ...(parentId && { isReply: true })
    };
    
    setComments(prev => [...prev, newComment]);
  };
  
  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };
  
  const handleReplyToComment = (commentId: string) => {
    // Handle reply functionality
    console.log('Replying to comment:', commentId);
  };

  const renderFeedModeSelector = () => (
    <View style={styles.feedModeSelector}>
      <GlassmorphicCard style={styles.feedModeCard}>
        {[
          { id: 'nearby', label: 'Nearby' },
          { id: 'following', label: 'Following' },
          { id: 'trending', label: 'Trending' },
        ].map((mode) => (
          <AccessibilityWrapper
            key={mode.id}
            label={`Switch to ${mode.label} feed`}
            role="button"
            state={{ selected: feedMode === mode.id }}
          >
            <TouchableOpacity
              style={[
                styles.feedModeButton,
                feedMode === mode.id && { 
                  backgroundColor: colors.primary + '30',
                  borderColor: colors.primary 
                }
              ]}
              onPress={() => setFeedMode(mode.id as FeedMode)}
              accessibilityRole="button"
              accessibilityState={{ selected: feedMode === mode.id }}
            >
              <MuralText 
                variant="subtitle" 
                style={[
                  styles.feedModeText,
                  { color: feedMode === mode.id ? colors.primary : colors.textSecondary }
                ]}
              >
                {mode.label}
              </MuralText>
            </TouchableOpacity>
          </AccessibilityWrapper>
        ))}
      </GlassmorphicCard>
    </View>
  );

  const ListHeaderComponent = () => (
    <View style={styles.header}>
      <View style={styles.brandHeader}>
        <MuralLogo size={32} />
        <MuralText variant="logo" style={styles.brandTitle}>
          Mural
        </MuralText>
      </View>
      
      <AccessibilityWrapper
        label="Current location: New York, NY"
        role="text"
      >
        <View style={styles.locationContainer}>
          <MapPin size={18} color={colors.primary} />
          <MuralText variant="subtitle" style={styles.location}>
            New York, NY
          </MuralText>
        </View>
      </AccessibilityWrapper>
      
      <MuralText variant="logo" style={styles.title}>
        {feedMode === 'nearby' ? 'Nearby Murals' : 
         feedMode === 'following' ? 'Following' : 'Trending Now'}
      </MuralText>
      
      <MuralText variant="tagline" style={styles.subtitle}>
        {feedMode === 'nearby' ? 'Discover amazing street art in your area' :
         feedMode === 'following' ? 'Latest from artists you follow' :
         'Most popular murals this week'}
      </MuralText>
      
      {renderFeedModeSelector()}
    </View>
  );

  if (loading) {
    return <LoadingState variant="fullscreen" message="Loading your feed..." showLogo />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar style="light" />
        
        <Animated.View style={[styles.animatedHeader, headerAnimatedStyle]}>
          <LinearGradient
            colors={[colors.background, 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View style={[styles.animatedHeaderContent, headerTitleStyle]}>
            <MuralLogo size={24} />
            <MuralText variant="tagline" style={styles.headerTitle}>
              {feedMode === 'nearby' ? 'Nearby Murals' : 
               feedMode === 'following' ? 'Following' : 'Trending'}
            </MuralText>
          </Animated.View>
        </Animated.View>
        
        {error && (
          <View style={styles.errorContainer}>
            <MuralText variant="subtitle" style={styles.errorText}>
              {error}
            </MuralText>
            <TouchableOpacity onPress={() => setError(null)}>
              <MuralText variant="tagline" style={{ color: colors.primary }}>
                Dismiss
              </MuralText>
            </TouchableOpacity>
          </View>
        )}
        
        <ArtFeed
          posts={posts}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onBookmark={handleBookmark}
          onPlayTimelapse={handlePlayTimelapse}
        />
        
        {/* Comments Modal */}
        <Modal
          visible={showComments}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowComments(false)}
        >
          <SafeAreaView style={[styles.commentsModal, { backgroundColor: colors.background }]}>
            <View style={styles.commentsHeader}>
              <MuralText variant="logo" style={styles.commentsTitle}>
                Comments
              </MuralText>
              <TouchableOpacity 
                style={styles.closeCommentsButton}
                onPress={() => setShowComments(false)}
                accessibilityLabel="Close comments"
                accessibilityRole="button"
              >
                <MuralText variant="tagline" style={{ color: colors.primary }}>
                  Done
                </MuralText>
              </TouchableOpacity>
            </View>
            
            <CommentSystem
              comments={comments}
              onAddComment={handleAddComment}
              onLikeComment={handleLikeComment}
              onReplyToComment={handleReplyToComment}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    marginLeft: 12,
    fontSize: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    marginLeft: 4,
    fontSize: 14,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.8,
  },
  feedModeSelector: {
    marginBottom: 16,
  },
  feedModeCard: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 20,
  },
  feedModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 44, // Accessibility: minimum touch target
  },
  feedModeText: {
    fontSize: 14,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  animatedHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 18,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    flex: 1,
  },
  commentsModal: {
    flex: 1,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  commentsTitle: {
    fontSize: 20,
  },
  closeCommentsButton: {
    padding: 8,
    minHeight: 44, // Accessibility: minimum touch target
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});