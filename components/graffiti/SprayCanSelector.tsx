import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SprayCan as Spray, Zap, Circle, Minus, Chrome } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import MuralText from '../ui/MuralText';

type SprayCanType = 'wide' | 'skinny' | 'fat' | 'detail' | 'chrome';

interface SprayCanSelectorProps {
  selectedCan: SprayCanType;
  onSelectCan: (canType: SprayCanType) => void;
  pressure: number;
}

const SPRAY_CANS = [
  {
    id: 'wide' as SprayCanType,
    name: 'Wide',
    icon: Spray,
    description: 'Large coverage',
    color: '#6366F1',
  },
  {
    id: 'skinny' as SprayCanType,
    name: 'Skinny',
    icon: Minus,
    description: 'Precise lines',
    color: '#EC4899',
  },
  {
    id: 'fat' as SprayCanType,
    name: 'Fat',
    icon: Circle,
    description: 'Max coverage',
    color: '#06B6D4',
  },
  {
    id: 'detail' as SprayCanType,
    name: 'Detail',
    icon: Zap,
    description: 'Fine work',
    color: '#10B981',
  },
  {
    id: 'chrome' as SprayCanType,
    name: 'Chrome',
    icon: Chrome,
    description: 'Metallic',
    color: '#F59E0B',
  }
];

export default function SprayCanSelector({
  selectedCan,
  onSelectCan,
  pressure
}: SprayCanSelectorProps) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cansContainer}
      >
        {SPRAY_CANS.map((can) => {
          const isSelected = selectedCan === can.id;
          
          return (
            <TouchableOpacity
              key={can.id}
              style={[
                styles.canButton,
                isSelected && { 
                  borderColor: can.color,
                  borderWidth: 2,
                  backgroundColor: can.color + '20'
                }
              ]}
              onPress={() => onSelectCan(can.id)}
              activeOpacity={0.8}
            >
              <can.icon 
                size={20} 
                color={isSelected ? can.color : colors.text} 
              />
              
              <MuralText 
                variant="subtitle" 
                style={[
                  styles.canName,
                  { color: isSelected ? can.color : colors.text }
                ]}
              >
                {can.name}
              </MuralText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  cansContainer: {
    paddingHorizontal: 4,
  },
  canButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  canName: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});