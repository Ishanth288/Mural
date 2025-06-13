import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';

type BadgeItemProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earned?: boolean;
};

export default function BadgeItem({ 
  title, 
  description, 
  icon, 
  color, 
  earned = false 
}: BadgeItemProps) {
  const { colors } = useTheme();
  
  return (
    <GlassmorphicCard style={[
      styles.container,
      !earned && { opacity: 0.6 }
    ]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        {icon}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      
      {earned && (
        <View style={[styles.earnedBadge, { backgroundColor: color }]}>
          <Text style={styles.earnedText}>Earned</Text>
        </View>
      )}
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  earnedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  earnedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#FFFFFF',
  },
});