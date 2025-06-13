import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight, Chrome as Home } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import MuralText from './MuralText';
import AccessibilityWrapper from './AccessibilityWrapper';

interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: React.ComponentType<any>;
}

interface NavigationBreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export default function NavigationBreadcrumbs({ 
  items, 
  showHome = true 
}: NavigationBreadcrumbsProps) {
  const { colors } = useTheme();
  
  const handleNavigation = (route?: string) => {
    if (route) {
      router.push(route as any);
    }
  };
  
  const allItems = showHome 
    ? [{ label: 'Home', route: '/(tabs)', icon: Home }, ...items]
    : items;
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const isClickable = !isLast && item.route;
        
        return (
          <View key={`${item.label}-${index}`} style={styles.breadcrumbContainer}>
            <AccessibilityWrapper
              label={`Navigate to ${item.label}`}
              role={isClickable ? 'button' : 'text'}
              state={{ disabled: !isClickable }}
            >
              <TouchableOpacity
                style={[
                  styles.breadcrumbItem,
                  !isClickable && styles.disabledItem
                ]}
                onPress={() => handleNavigation(item.route)}
                disabled={!isClickable}
                activeOpacity={isClickable ? 0.7 : 1}
              >
                {item.icon && (
                  <item.icon 
                    size={16} 
                    color={isLast ? colors.primary : colors.textSecondary}
                    style={styles.breadcrumbIcon}
                  />
                )}
                
                <MuralText 
                  variant="subtitle" 
                  style={[
                    styles.breadcrumbText,
                    { 
                      color: isLast ? colors.primary : colors.textSecondary,
                      fontWeight: isLast ? '600' : '400'
                    }
                  ]}
                >
                  {item.label}
                </MuralText>
              </TouchableOpacity>
            </AccessibilityWrapper>
            
            {!isLast && (
              <ChevronRight 
                size={14} 
                color={colors.textMuted} 
                style={styles.separator}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 40,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    minHeight: 32,
  },
  disabledItem: {
    opacity: 1,
  },
  breadcrumbIcon: {
    marginRight: 4,
  },
  breadcrumbText: {
    fontSize: 14,
  },
  separator: {
    marginHorizontal: 4,
  },
});