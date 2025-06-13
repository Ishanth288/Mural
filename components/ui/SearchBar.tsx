import React from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  Animated
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from './GlassmorphicCard';

type SearchBarProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
};

export default function SearchBar({ 
  placeholder, 
  value, 
  onChangeText, 
  onSubmit, 
  onClear 
}: SearchBarProps) {
  const { colors } = useTheme();
  
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };
  
  return (
    <GlassmorphicCard style={styles.container} variant="strong">
      <Search size={20} color={colors.textSecondary} strokeWidth={1.5} />
      <TextInput
        style={[
          styles.input,
          { color: colors.text }
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity 
          onPress={handleClear} 
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <X size={16} color={colors.textSecondary} strokeWidth={1.5} />
        </TouchableOpacity>
      )}
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    flex: 1,
    borderRadius: 24,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 0 : 8,
    letterSpacing: -0.2,
  },
  clearButton: {
    padding: 8,
    marginRight: -8,
  },
});