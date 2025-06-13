import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '@/components/ui/GlassmorphicCard';

const { width } = Dimensions.get('window');

type ArtProps = {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  location: string;
  likes: number;
  comments: number;
  timeAgo: string;
};

type ArtCardProps = {
  art: ArtProps;
};

export default function ArtCard({ art }: ArtCardProps) {
  const { colors } = useTheme();
  
  return (
    <GlassmorphicCard style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: art.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />
        <View style={styles.locationContainer}>
          <MapPin size={14} color={colors.primary} />
          <Text style={styles.location}>{art.location}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{art.title}</Text>
            <Text style={[styles.artist, { color: colors.textSecondary }]}>
              by {art.artist} • {art.timeAgo}
            </Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={20} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {art.likes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={20} color={colors.secondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {art.comments}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 200,
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
    height: 80,
  },
  locationContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  location: {
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  artist: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
});