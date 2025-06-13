import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { Heart, Star, Smile, Zap, Flame, Crown, Diamond, Music } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import MuralText from '../ui/MuralText';

const { width } = Dimensions.get('window');

type StickerCategory = {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  stickers: Sticker[];
};

type Sticker = {
  id: string;
  name: string;
  imageUrl?: string;
  icon?: React.ComponentType<any>;
  isPremium?: boolean;
  isAnimated?: boolean;
  price?: number;
};

type StickerLibraryProps = {
  onSelectSticker: (sticker: Sticker) => void;
  onClose: () => void;
};

const STICKER_CATEGORIES: StickerCategory[] = [
  {
    id: 'graffiti',
    name: 'Graffiti',
    icon: Zap,
    stickers: [
      { id: 'tag1', name: 'Spray Tag', imageUrl: 'https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg' },
      { id: 'tag2', name: 'Bubble Letters', imageUrl: 'https://images.pexels.com/photos/2119706/pexels-photo-2119706.jpeg' },
      { id: 'tag3', name: 'Wildstyle', imageUrl: 'https://images.pexels.com/photos/1690351/pexels-photo-1690351.jpeg', isPremium: true },
      { id: 'tag4', name: 'Throw-up', imageUrl: 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg' },
    ]
  },
  {
    id: 'urban',
    name: 'Urban',
    icon: Crown,
    stickers: [
      { id: 'urban1', name: 'City Skyline', imageUrl: 'https://images.pexels.com/photos/2693212/pexels-photo-2693212.png' },
      { id: 'urban2', name: 'Street Sign', imageUrl: 'https://images.pexels.com/photos/4100130/pexels-photo-4100130.jpeg' },
      { id: 'urban3', name: 'Brick Wall', imageUrl: 'https://images.pexels.com/photos/1293120/pexels-photo-1293120.jpeg' },
      { id: 'urban4', name: 'Neon Sign', imageUrl: 'https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg', isAnimated: true, isPremium: true },
    ]
  },
  {
    id: 'emojis',
    name: 'Emojis',
    icon: Smile,
    stickers: [
      { id: 'emoji1', name: 'Fire', icon: Flame },
      { id: 'emoji2', name: 'Star', icon: Star },
      { id: 'emoji3', name: 'Heart', icon: Heart },
      { id: 'emoji4', name: 'Diamond', icon: Diamond, isPremium: true },
    ]
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: Star,
    stickers: [
      { id: 'nature1', name: 'Tree', imageUrl: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg' },
      { id: 'nature2', name: 'Flower', imageUrl: 'https://images.pexels.com/photos/315658/pexels-photo-315658.jpeg' },
      { id: 'nature3', name: 'Mountain', imageUrl: 'https://images.pexels.com/photos/1484516/pexels-photo-1484516.jpeg' },
      { id: 'nature4', name: 'Ocean Wave', imageUrl: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg', isAnimated: true },
    ]
  },
  {
    id: 'music',
    name: 'Music',
    icon: Music,
    stickers: [
      { id: 'music1', name: 'Headphones', imageUrl: 'https://images.pexels.com/photos/3756616/pexels-photo-3756616.jpeg' },
      { id: 'music2', name: 'Vinyl Record', imageUrl: 'https://images.pexels.com/photos/3756619/pexels-photo-3756619.jpeg' },
      { id: 'music3', name: 'Microphone', imageUrl: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg', isPremium: true },
      { id: 'music4', name: 'Sound Wave', imageUrl: 'https://images.pexels.com/photos/744318/pexels-photo-744318.jpeg', isAnimated: true },
    ]
  }
];

export default function StickerLibrary({ onSelectSticker, onClose }: StickerLibraryProps) {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(STICKER_CATEGORIES[0].id);
  
  const selectedCategoryData = STICKER_CATEGORIES.find(cat => cat.id === selectedCategory);
  
  const renderSticker = (sticker: Sticker) => {
    return (
      <TouchableOpacity
        key={sticker.id}
        style={styles.stickerItem}
        onPress={() => onSelectSticker(sticker)}
        activeOpacity={0.8}
      >
        <View style={[
          styles.stickerContainer,
          sticker.isPremium && { borderColor: colors.warning, borderWidth: 2 }
        ]}>
          {sticker.imageUrl ? (
            <Image 
              source={{ uri: sticker.imageUrl }}
              style={styles.stickerImage}
              resizeMode="cover"
            />
          ) : sticker.icon ? (
            <View style={styles.iconContainer}>
              <sticker.icon size={32} color={colors.primary} />
            </View>
          ) : null}
          
          {sticker.isAnimated && (
            <View style={styles.animatedBadge}>
              <MuralText variant="subtitle" style={styles.animatedText}>
                GIF
              </MuralText>
            </View>
          )}
          
          {sticker.isPremium && (
            <View style={styles.premiumBadge}>
              <Crown size={12} color={colors.warning} />
            </View>
          )}
        </View>
        
        <MuralText variant="subtitle" style={styles.stickerName} numberOfLines={1}>
          {sticker.name}
        </MuralText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.overlay}>
      <GlassmorphicCard style={styles.container}>
        <View style={styles.header}>
          <MuralText variant="logo" style={styles.title}>
            Sticker Library
          </MuralText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MuralText variant="tagline" style={{ color: colors.primary }}>
              Done
            </MuralText>
          </TouchableOpacity>
        </View>
        
        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={styles.categoryTabsContent}
        >
          {STICKER_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && { 
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary 
                }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <category.icon 
                size={20} 
                color={selectedCategory === category.id ? colors.primary : colors.textSecondary} 
              />
              <MuralText 
                variant="subtitle" 
                style={[
                  styles.categoryTabText,
                  { color: selectedCategory === category.id ? colors.primary : colors.textSecondary }
                ]}
              >
                {category.name}
              </MuralText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Stickers Grid */}
        <ScrollView 
          style={styles.stickersContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stickersGrid}>
            {selectedCategoryData?.stickers.map(renderSticker)}
          </View>
          
          {/* Premium Upsell */}
          <GlassmorphicCard style={styles.premiumUpsell}>
            <Crown size={24} color={colors.warning} />
            <MuralText variant="tagline" style={styles.premiumTitle}>
              Unlock Premium Stickers
            </MuralText>
            <MuralText variant="subtitle" style={styles.premiumDescription}>
              Get access to 500+ exclusive animated stickers and effects
            </MuralText>
            <TouchableOpacity style={[styles.premiumButton, { backgroundColor: colors.warning }]}>
              <MuralText variant="tagline" style={styles.premiumButtonText}>
                Upgrade Now
              </MuralText>
            </TouchableOpacity>
          </GlassmorphicCard>
        </ScrollView>
      </GlassmorphicCard>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
  },
  closeButton: {
    padding: 8,
  },
  categoryTabs: {
    marginBottom: 16,
  },
  categoryTabsContent: {
    paddingHorizontal: 4,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryTabText: {
    marginLeft: 6,
    fontSize: 12,
  },
  stickersContainer: {
    flex: 1,
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stickerItem: {
    width: (width - 80) / 4,
    marginBottom: 16,
    alignItems: 'center',
  },
  stickerContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0, 255, 0, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  animatedText: {
    fontSize: 8,
    color: 'white',
  },
  premiumBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    padding: 2,
    borderRadius: 4,
  },
  stickerName: {
    marginTop: 4,
    fontSize: 10,
    textAlign: 'center',
  },
  premiumUpsell: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  premiumTitle: {
    marginTop: 8,
    marginBottom: 4,
  },
  premiumDescription: {
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.8,
  },
  premiumButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  premiumButtonText: {
    color: 'white',
    fontSize: 14,
  },
});