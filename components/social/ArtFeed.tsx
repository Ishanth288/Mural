import React, { useState, useRef, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Image
} from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark, MoveHorizontal as MoreHorizontal, Play } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import MuralText from '../ui/MuralText';
import MuralLogo from '../ui/MuralLogo';

const { width } = Dimensions.get('window');

type ArtPost = {
  id: string;
  artist: {
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  location: string;
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  isLiked: boolean;
  isBookmarked: boolean;
  hasTimelapseVideo: boolean;
  collaborators?: string[];
};

type ArtFeedProps = {
  posts: ArtPost[];
  onRefresh: () => void;
  refreshing: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onPlayTimelapse: (postId: string) => void;
};

export default function ArtFeed({
  posts,
  onRefresh,
  refreshing,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onPlayTimelapse
}: ArtFeedProps) {
  const { colors } = useTheme();
  const [viewableItems, setViewableItems] = useState<string[]>([]);
  
  // CRITICAL FIX: Stable callback reference to prevent FlatList error
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    setViewableItems(viewableItems.map((item: any) => item.key));
  }, []);
  
  // CRITICAL FIX: Stable viewability config
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;
  
  const renderPost = ({ item }: { item: ArtPost }) => {
    return (
      <GlassmorphicCard style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.artistInfo}>
            <Image 
              source={{ uri: item.artist.avatar }}
              style={styles.avatar}
            />
            <View style={styles.artistDetails}>
              <View style={styles.artistName}>
                <MuralText variant="tagline" style={styles.username}>
                  {item.artist.username}
                </MuralText>
                {item.artist.isVerified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: colors.primary }]}>
                    <MuralText variant="subtitle" style={styles.verifiedText}>
                      ✓
                    </MuralText>
                  </View>
                )}
              </View>
              <MuralText variant="subtitle" style={styles.location}>
                {item.location} • {item.timeAgo}
              </MuralText>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.moreButton}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <MoreHorizontal size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Post Content */}
        <View style={styles.postContent}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.imageUrl }}
              style={styles.postImage}
              resizeMode="cover"
            />
            
            {/* Timelapse Play Button */}
            {item.hasTimelapseVideo && (
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => onPlayTimelapse(item.id)}
                accessibilityRole="button"
                accessibilityLabel="Play timelapse video"
              >
                <View style={[styles.playButtonInner, { backgroundColor: colors.primary }]}>
                  <Play size={24} color="white" />
                </View>
              </TouchableOpacity>
            )}
            
            {/* Mural Watermark */}
            <View style={styles.postWatermark}>
              <MuralLogo size={12} color="rgba(255, 255, 255, 0.6)" />
            </View>
            
            {/* Collaborators */}
            {item.collaborators && item.collaborators.length > 0 && (
              <View style={styles.collaborators}>
                <MuralText variant="subtitle" style={styles.collaboratorsText}>
                  +{item.collaborators.length} collaborators
                </MuralText>
              </View>
            )}
          </View>
          
          <View style={styles.postDetails}>
            <MuralText variant="tagline" style={styles.postTitle}>
              {item.title}
            </MuralText>
            <MuralText variant="subtitle" style={styles.postDescription}>
              {item.description}
            </MuralText>
          </View>
        </View>
        
        {/* Post Actions */}
        <View style={styles.postActions}>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onLike(item.id)}
              accessibilityRole="button"
              accessibilityLabel={item.isLiked ? "Unlike post" : "Like post"}
            >
              <Heart 
                size={24} 
                color={item.isLiked ? colors.error : colors.textSecondary}
                fill={item.isLiked ? colors.error : 'none'}
              />
              <MuralText variant="subtitle" style={styles.actionCount}>
                {item.likes}
              </MuralText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onComment(item.id)}
              accessibilityRole="button"
              accessibilityLabel="View comments"
            >
              <MessageCircle size={24} color={colors.textSecondary} />
              <MuralText variant="subtitle" style={styles.actionCount}>
                {item.comments}
              </MuralText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onShare(item.id)}
              accessibilityRole="button"
              accessibilityLabel="Share post"
            >
              <Share2 size={24} color={colors.textSecondary} />
              <MuralText variant="subtitle" style={styles.actionCount}>
                {item.shares}
              </MuralText>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            onPress={() => onBookmark(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.isBookmarked ? "Remove bookmark" : "Bookmark post"}
          >
            <Bookmark 
              size={24} 
              color={item.isBookmarked ? colors.warning : colors.textSecondary}
              fill={item.isBookmarked ? colors.warning : 'none'}
            />
          </TouchableOpacity>
        </View>
      </GlassmorphicCard>
    );
  };

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={10}
      initialNumToRender={3}
      getItemLayout={(data, index) => ({
        length: 400, // Approximate item height
        offset: 400 * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  artistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  artistDetails: {
    flex: 1,
  },
  artistName: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedBadge: {
    marginLeft: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 10,
    color: 'white',
  },
  location: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
    minWidth: 44, // Accessibility: minimum touch target
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContent: {
    paddingHorizontal: 16,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  playButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  postWatermark: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  collaborators: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  collaboratorsText: {
    color: 'white',
    fontSize: 10,
  },
  postDetails: {
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  postDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    minWidth: 44, // Accessibility: minimum touch target
    minHeight: 44,
    justifyContent: 'center',
  },
  actionCount: {
    marginLeft: 6,
    fontSize: 14,
  },
  separator: {
    height: 8,
  },
});