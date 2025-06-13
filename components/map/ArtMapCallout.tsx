import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Heart, User } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '@/components/ui/GlassmorphicCard';

const { width } = Dimensions.get('window');

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

type ArtMapCalloutProps = {
  art: ArtLocation;
};

export default function ArtMapCallout({ art }: ArtMapCalloutProps) {
  const { colors } = useTheme();
  
  return (
    <GlassmorphicCard style={styles.container}>
      <Image 
        source={{ uri: art.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {art.title}
        </Text>
        
        <View style={styles.artistRow}>
          <User size={12} color={colors.secondary} />
          <Text style={[styles.artist, { color: colors.textSecondary }]}>
            {art.artist}
          </Text>
        </View>
        
        <View style={styles.statsRow}>
          <Heart size={12} color={colors.primary} />
          <Text style={[styles.stats, { color: colors.textSecondary }]}>
            {art.likes}
          </Text>
        </View>
      </View>
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.6,
    maxWidth: 220,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: 8,
  },
  title: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 14,
    marginBottom: 4,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  artist: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 4,
  },
});