import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';

type ColorPickerProps = {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  onClose: () => void;
};

const COLORS = [
  '#FF0080', // Neon Pink
  '#00FFFF', // Neon Cyan
  '#8A2BE2', // Neon Purple
  '#FFFF00', // Neon Yellow
  '#39FF14', // Neon Green
  '#FF3131', // Neon Red
  '#FF7F00', // Neon Orange
  '#1E90FF', // Neon Blue
  '#FFFFFF', // White
  '#000000', // Black
];

export default function ColorPicker({ 
  selectedColor, 
  onSelectColor, 
  onClose 
}: ColorPickerProps) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.overlay}>
      <GlassmorphicCard style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Select Color
        </Text>
        
        <View style={styles.colorsContainer}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor,
                selectedColor === color && { borderColor: color === '#FFFFFF' ? '#000000' : '#FFFFFF' }
              ]}
              onPress={() => onSelectColor(color)}
            />
          ))}
        </View>
        
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
    alignItems: 'center',
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
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderWidth: 2,
    transform: [{ scale: 1.2 }],
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});