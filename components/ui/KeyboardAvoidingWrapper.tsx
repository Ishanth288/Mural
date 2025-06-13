import React, { ReactNode } from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet,
  ViewStyle
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface KeyboardAvoidingWrapperProps {
  children: ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  behavior?: 'height' | 'position' | 'padding';
}

export default function KeyboardAvoidingWrapper({
  children,
  style,
  scrollable = false,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height'
}: KeyboardAvoidingWrapperProps) {
  const insets = useSafeAreaInsets();
  
  const keyboardVerticalOffset = Platform.OS === 'ios' ? insets.top : 0;
  
  if (scrollable) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, style]}
        behavior={behavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});