import React, { ReactNode } from 'react';
import { View, ViewProps, AccessibilityProps } from 'react-native';

interface AccessibilityWrapperProps extends ViewProps, AccessibilityProps {
  children: ReactNode;
  label?: string;
  hint?: string;
  role?: 'button' | 'image' | 'text' | 'header' | 'link' | 'search' | 'none';
  state?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    expanded?: boolean;
  };
  actions?: Array<{
    name: string;
    label: string;
  }>;
}

export default function AccessibilityWrapper({
  children,
  label,
  hint,
  role,
  state,
  actions,
  ...props
}: AccessibilityWrapperProps) {
  const accessibilityProps: AccessibilityProps = {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
    ...props,
  };

  // Add state information
  if (state) {
    if (state.disabled) {
      accessibilityProps.accessibilityState = { disabled: true };
    }
    if (state.selected !== undefined) {
      accessibilityProps.accessibilityState = { 
        ...accessibilityProps.accessibilityState,
        selected: state.selected 
      };
    }
    if (state.checked !== undefined) {
      accessibilityProps.accessibilityState = { 
        ...accessibilityProps.accessibilityState,
        checked: state.checked 
      };
    }
    if (state.expanded !== undefined) {
      accessibilityProps.accessibilityState = { 
        ...accessibilityProps.accessibilityState,
        expanded: state.expanded 
      };
    }
  }

  // Add custom actions
  if (actions) {
    accessibilityProps.accessibilityActions = actions;
  }

  return (
    <View {...accessibilityProps} {...props}>
      {children}
    </View>
  );
}

// High contrast mode hook
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = React.useState(false);
  
  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
  };
  
  const getContrastColors = (normalColor: string, highContrastColor: string) => {
    return isHighContrast ? highContrastColor : normalColor;
  };
  
  return {
    isHighContrast,
    toggleHighContrast,
    getContrastColors,
  };
}

// Focus management hook
export function useFocusManagement() {
  const focusRef = React.useRef<View>(null);
  
  const setFocus = () => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  };
  
  const clearFocus = () => {
    if (focusRef.current) {
      focusRef.current.blur();
    }
  };
  
  return {
    focusRef,
    setFocus,
    clearFocus,
  };
}