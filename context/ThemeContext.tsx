import React, { createContext, useContext, ReactNode, useState } from 'react';
import { Platform } from 'react-native';

interface ThemeColors {
  // Main colors
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  
  // Background colors
  background: string;
  card: string;
  cardTransparent: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Semantic colors
  info: string;
  
  // Glass effect colors
  glass: string;
  glassBorder: string;
  glassStrong: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const defaultColors: ThemeColors = {
  // Main brand colors
  primary: '#6366F1', // Indigo
  secondary: '#EC4899', // Pink
  accent: '#06B6D4', // Cyan
  
  // Semantic colors
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  info: '#3B82F6', // Blue
  
  // Background colors
  background: '#0F172A', // Slate 900
  card: '#1E293B', // Slate 800
  cardTransparent: 'rgba(30, 41, 59, 0.8)', // Slate 800 with alpha
  
  // Text colors
  text: '#F8FAFC', // Slate 50
  textSecondary: '#CBD5E1', // Slate 300
  textMuted: '#64748B', // Slate 500
  
  // Border colors
  border: '#334155', // Slate 700
  borderLight: 'rgba(255, 255, 255, 0.12)',
  
  // Glass effect colors
  glass: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassStrong: 'rgba(255, 255, 255, 0.15)',
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
  };
  
  const colors = isDark ? defaultColors : defaultColors; // Replace with light theme if needed
  
  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}