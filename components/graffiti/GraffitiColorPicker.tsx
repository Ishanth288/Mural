import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal
} from 'react-native';
import { Palette } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import MuralText from '../ui/MuralText';

interface GraffitiColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const GRAFFITI_COLORS = [
  '#FF0080', // Neon Pink
  '#00FFFF', // Neon Cyan
  '#FFFF00', // Neon Yellow
  '#39FF14', // Neon Green
  '#FF3131', // Neon Red
  '#8A2BE2', // Neon Purple
  '#FF7F00', // Neon Orange
  '#1E90FF', // Neon Blue
];

export default function GraffitiColorPicker({
  selectedColor,
  onSelectColor
}: GraffitiColorPickerProps) {
  const { colors } = useTheme();
  const [showFullPicker, setShowFullPicker] = useState(false);
  
  const renderColorButton = (color: string, size: number = 24) => {
    const isSelected = selectedColor === color;
    
    return (
      <TouchableOpacity
        key={color}
        style={[
          styles.colorButton,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            backgroundColor: color,
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)'
          }
        ]}
        onPress={() => onSelectColor(color)}
        activeOpacity={0.8}
      />
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selectedColorDisplay}
        onPress={() => setShowFullPicker(true)}
      >
        {renderColorButton(selectedColor, 32)}
      </TouchableOpacity>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickColors}
      >
        {GRAFFITI_COLORS.slice(0, 4).map(color => renderColorButton(color, 24))}
      </ScrollView>
      
      {/* Full Color Picker Modal */}
      <Modal
        visible={showFullPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFullPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassmorphicCard style={styles.fullPickerContainer}>
            <View style={styles.pickerHeader}>
              <Palette size={24} color={colors.primary} />
              <MuralText variant="logo" style={styles.pickerTitle}>
                Colors
              </MuralText>
              <TouchableOpacity 
                onPress={() => setShowFullPicker(false)}
                style={styles.closeButton}
              >
                <MuralText variant="tagline" style={{ color: colors.primary }}>
                  Done
                </MuralText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.colorGrid}>
              {GRAFFITI_COLORS.map(color => renderColorButton(color, 40))}
            </View>
          </GlassmorphicCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedColorDisplay: {
    marginRight: 8,
  },
  quickColors: {
    flexDirection: 'row',
  },
  colorButton: {
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullPickerContainer: {
    width: '100%',
    maxHeight: '60%',
    padding: 20,
    borderRadius: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 20,
  },
  closeButton: {
    padding: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});