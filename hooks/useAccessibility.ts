import { useState, useEffect, useCallback } from 'react';
import { Platform, AccessibilityInfo } from 'react-native';

interface AccessibilityState {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  preferredFontScale: number;
  isVoiceOverEnabled: boolean;
  isTalkBackEnabled: boolean;
}

interface AccessibilityPreferences {
  announceChanges: boolean;
  useHighContrast: boolean;
  reducedMotion: boolean;
  largerText: boolean;
  hapticFeedback: boolean;
}

export function useAccessibility() {
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isHighContrastEnabled: false,
    preferredFontScale: 1,
    isVoiceOverEnabled: false,
    isTalkBackEnabled: false
  });
  
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    announceChanges: true,
    useHighContrast: false,
    reducedMotion: false,
    largerText: false,
    hapticFeedback: true
  });
  
  useEffect(() => {
    checkAccessibilitySettings();
    
    // Set up listeners for accessibility changes
    const listeners: Array<() => void> = [];
    
    if (Platform.OS !== 'web') {
      const screenReaderListener = AccessibilityInfo.addEventListener(
        'screenReaderChanged',
        (isEnabled) => {
          setAccessibilityState(prev => ({
            ...prev,
            isScreenReaderEnabled: isEnabled
          }));
        }
      );
      
      const reduceMotionListener = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (isEnabled) => {
          setAccessibilityState(prev => ({
            ...prev,
            isReduceMotionEnabled: isEnabled
          }));
        }
      );
      
      listeners.push(
        () => screenReaderListener?.remove(),
        () => reduceMotionListener?.remove()
      );
    } else {
      // Web-specific accessibility detection
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleMotionChange = (e: MediaQueryListEvent) => {
        setAccessibilityState(prev => ({
          ...prev,
          isReduceMotionEnabled: e.matches
        }));
      };
      
      mediaQuery.addEventListener('change', handleMotionChange);
      listeners.push(() => mediaQuery.removeEventListener('change', handleMotionChange));
      
      // Check for high contrast
      const contrastQuery = window.matchMedia('(prefers-contrast: high)');
      const handleContrastChange = (e: MediaQueryListEvent) => {
        setAccessibilityState(prev => ({
          ...prev,
          isHighContrastEnabled: e.matches
        }));
      };
      
      contrastQuery.addEventListener('change', handleContrastChange);
      listeners.push(() => contrastQuery.removeEventListener('change', handleContrastChange));
    }
    
    return () => {
      listeners.forEach(cleanup => cleanup());
    };
  }, []);
  
  const checkAccessibilitySettings = async () => {
    try {
      if (Platform.OS !== 'web') {
        const [
          isScreenReaderEnabled,
          isReduceMotionEnabled
        ] = await Promise.all([
          AccessibilityInfo.isScreenReaderEnabled(),
          AccessibilityInfo.isReduceMotionEnabled()
        ]);
        
        setAccessibilityState(prev => ({
          ...prev,
          isScreenReaderEnabled,
          isReduceMotionEnabled
        }));
      } else {
        // Web accessibility detection
        const isReduceMotionEnabled = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isHighContrastEnabled = window.matchMedia('(prefers-contrast: high)').matches;
        
        setAccessibilityState(prev => ({
          ...prev,
          isReduceMotionEnabled,
          isHighContrastEnabled
        }));
      }
    } catch (error) {
      console.warn('Failed to check accessibility settings:', error);
    }
  };
  
  const announceForAccessibility = useCallback((message: string) => {
    if (!preferences.announceChanges) return;
    
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(message);
    } else {
      // Web announcement using ARIA live region
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, [preferences.announceChanges]);
  
  const setFocus = useCallback((element: any) => {
    if (Platform.OS !== 'web') {
      AccessibilityInfo.setAccessibilityFocus(element);
    } else if (element && element.focus) {
      element.focus();
    }
  }, []);
  
  const getAccessibleColors = useCallback((normalColors: any, highContrastColors: any) => {
    return (accessibilityState.isHighContrastEnabled || preferences.useHighContrast) 
      ? highContrastColors 
      : normalColors;
  }, [accessibilityState.isHighContrastEnabled, preferences.useHighContrast]);
  
  const getMotionPreference = useCallback(() => {
    return accessibilityState.isReduceMotionEnabled || preferences.reducedMotion 
      ? 'reduce' 
      : 'normal';
  }, [accessibilityState.isReduceMotionEnabled, preferences.reducedMotion]);
  
  const getFontScale = useCallback(() => {
    const baseScale = accessibilityState.preferredFontScale;
    const userScale = preferences.largerText ? 1.2 : 1;
    return baseScale * userScale;
  }, [accessibilityState.preferredFontScale, preferences.largerText]);
  
  const updatePreferences = useCallback((newPreferences: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);
  
  const getAccessibilityProps = useCallback((options: {
    label?: string;
    hint?: string;
    role?: string;
    state?: Record<string, boolean>;
    actions?: Array<{ name: string; label: string }>;
  }) => {
    const { label, hint, role, state, actions } = options;
    
    const props: any = {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role,
    };
    
    if (state) {
      props.accessibilityState = state;
    }
    
    if (actions) {
      props.accessibilityActions = actions;
    }
    
    return props;
  }, []);
  
  const createAccessibilityAnnouncement = useCallback((
    type: 'success' | 'error' | 'info' | 'warning',
    message: string
  ) => {
    const prefix = {
      success: 'Success: ',
      error: 'Error: ',
      info: 'Information: ',
      warning: 'Warning: '
    }[type];
    
    announceForAccessibility(prefix + message);
  }, [announceForAccessibility]);
  
  const isAccessibilityEnabled = useCallback(() => {
    return accessibilityState.isScreenReaderEnabled || 
           accessibilityState.isVoiceOverEnabled || 
           accessibilityState.isTalkBackEnabled;
  }, [accessibilityState]);
  
  return {
    // State
    accessibilityState,
    preferences,
    
    // Actions
    announceForAccessibility,
    setFocus,
    updatePreferences,
    createAccessibilityAnnouncement,
    
    // Utilities
    getAccessibleColors,
    getMotionPreference,
    getFontScale,
    getAccessibilityProps,
    isAccessibilityEnabled,
    
    // Refresh
    checkAccessibilitySettings
  };
}

// Hook for managing focus
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<any>(null);
  const [focusHistory, setFocusHistory] = useState<any[]>([]);
  
  const setFocus = useCallback((element: any, options?: { savePrevious?: boolean }) => {
    if (options?.savePrevious && focusedElement) {
      setFocusHistory(prev => [...prev, focusedElement]);
    }
    
    setFocusedElement(element);
    
    if (Platform.OS !== 'web') {
      AccessibilityInfo.setAccessibilityFocus(element);
    } else if (element && element.focus) {
      element.focus();
    }
  }, [focusedElement]);
  
  const restorePreviousFocus = useCallback(() => {
    if (focusHistory.length > 0) {
      const previousElement = focusHistory[focusHistory.length - 1];
      setFocusHistory(prev => prev.slice(0, -1));
      setFocus(previousElement);
    }
  }, [focusHistory, setFocus]);
  
  const clearFocusHistory = useCallback(() => {
    setFocusHistory([]);
  }, []);
  
  return {
    focusedElement,
    setFocus,
    restorePreviousFocus,
    clearFocusHistory,
    hasPreviousFocus: focusHistory.length > 0
  };
}

// Hook for keyboard navigation
export function useKeyboardNavigation() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };
    
    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
  
  const handleKeyPress = useCallback((
    event: any,
    handlers: {
      onEnter?: () => void;
      onSpace?: () => void;
      onEscape?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onArrowLeft?: () => void;
      onArrowRight?: () => void;
    }
  ) => {
    const { key } = event.nativeEvent || event;
    
    switch (key) {
      case 'Enter':
        handlers.onEnter?.();
        break;
      case ' ':
      case 'Space':
        handlers.onSpace?.();
        break;
      case 'Escape':
        handlers.onEscape?.();
        break;
      case 'ArrowUp':
        handlers.onArrowUp?.();
        break;
      case 'ArrowDown':
        handlers.onArrowDown?.();
        break;
      case 'ArrowLeft':
        handlers.onArrowLeft?.();
        break;
      case 'ArrowRight':
        handlers.onArrowRight?.();
        break;
    }
  }, []);
  
  return {
    isKeyboardUser,
    handleKeyPress
  };
}