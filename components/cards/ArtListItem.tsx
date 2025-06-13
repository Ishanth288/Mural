import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Dimensions,
  Animated
} from 'react-native';
import { MapPin, Heart } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';

type ArtLocation = {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  location: string;
  distance: string;
  likes: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
};

type ArtListItemProps = {
  art: ArtLocation;
  onPress: () => void;
  fullWidth?: boolean;
};

export default function ArtListItem({ art, onPress, fullWidth = false }: ArtListItemProps) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.9}
      style={[
        styles.touchable,
        fullWidth && { marginHorizontal: 0, marginVertical: 8 }
      ]}
    >
      <GlassmorphicCard style={styles.container}>
        <Image 
          source={{ uri: art.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {art.title}
          </Text>
          
          <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>
            by {art.artist}
          </Text>
          
          <View style={styles.footer}>
            <View style={styles.locationContainer}>
              <MapPin size={14} color={colors.primary} strokeWidth={1.5} />
              <Text style={[styles.locationText, { color: colors.textMuted }]}>
                {art.distance}
              </Text>
            </View>
            
            <View style={styles.likesContainer}>
              <Heart size={14} color={colors.secondary} strokeWidth={1.5} />
              <Text style={[styles.likesText, { color: colors.textMuted }]}>
                {art.likes}
              </Text>
            </View>
          </View>
        </View>
      </GlassmorphicCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    margin: 12,
  },
  content: {
    flex: 1,
    padding: 12,
    paddingLeft: 0,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  artist: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  locationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginLeft: 4,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginLeft: 4,
  },
});