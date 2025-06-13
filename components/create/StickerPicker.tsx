import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';

type StickerPickerProps = {
  onSelectSticker: (sticker: string) => void;
  onClose: () => void;
};

const STICKER_CATEGORIES = [
  {
    name: 'Emojis',
    stickers: [
      'https://images.pexels.com/photos/3756616/pexels-photo-3756616.jpeg',
      'https://images.pexels.com/photos/3756619/pexels-photo-3756619.jpeg',
    ]
  },
  {
    name: 'Street Art',
    stickers: [
      'https://images.pexels.com/photos/2119706/pexels-photo-2119706.jpeg',
      'https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg',
    ]
  },
];

export default function StickerPicker({ onSelectSticker, onClose }: StickerPickerProps) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.overlay}>
      <GlassmorphicCard style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Stickers
        </Text>
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {STICKER_CATEGORIES.map((category) => (
            <View key={category.name} style={styles.category}>
              <Text style={[styles.categoryTitle, { color: colors.textSecondary }]}>
                {category.name}
              </Text>
              
              <View style={styles.stickersGrid}>
                {category.stickers.map((sticker, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.stickerButton}
                    onPress={() => onSelectSticker(sticker)}
                  >
                    <Image 
                      source={{ uri: sticker }}
                      style={styles.stickerImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
        
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.card }]}
          onPress={onClose}
        >
          <Text style={[styles.closeButtonText, { color: colors.text }]}>
            Done
          </Text>
        </TouchableOpacity>
      </GlassmorphicCard>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 180,
    left: 16,
    right: 16,
    maxHeight: 400,
  },
  container: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    maxHeight: 300,
  },
  category: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 12,
    paddingLeft: 4,
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  stickerButton: {
    width: '25%',
    aspectRatio: 1,
    padding: 4,
  },
  stickerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});