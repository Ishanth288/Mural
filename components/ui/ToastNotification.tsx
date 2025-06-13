import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Info, X, Circle as XCircle } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import MuralText from './MuralText';
import { useAccessibility } from '@/hooks/useAccessibility';

const { width } = Dimensions.get('window');

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  onDismiss: (id: string) => void;
}

interface ToastManagerState {
  toasts: ToastProps[];
}

// Toast component
function Toast({ 
  id, 
  type, 
  title, 
  message, 
  duration = 4000, 
  action, 
  onDismiss 
}: ToastProps) {
  const { colors } = useTheme();
  const { announceForAccessibility } = useAccessibility();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));
  
  useEffect(() => {
    // Announce toast for screen readers
    announceForAccessibility(`${type}: ${title}${message ? `. ${message}` : ''}`);
    
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(id);
    });
  };
  
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { Icon: CheckCircle, color: colors.success };
      case 'error':
        return { Icon: XCircle, color: colors.error };
      case 'warning':
        return { Icon: AlertTriangle, color: colors.warning };
      case 'info':
      default:
        return { Icon: Info, color: colors.primary };
    }
  };
  
  const { Icon, color } = getIconAndColor();
  
  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: colors.card,
          borderLeftColor: color,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.iconContainer}>
        <Icon size={24} color={color} />
      </View>
      
      <View style={styles.content}>
        <MuralText variant="tagline" style={[styles.title, { color: colors.text }]}>
          {title}
        </MuralText>
        
        {message && (
          <MuralText variant="subtitle" style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </MuralText>
        )}
        
        {action && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: color }]}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <MuralText variant="subtitle" style={[styles.actionText, { color }]}>
              {action.label}
            </MuralText>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={handleDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
      >
        <X size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Toast Manager
class ToastManager {
  private static instance: ToastManager;
  private listeners: Array<(toasts: ToastProps[]) => void> = [];
  private toasts: ToastProps[] = [];
  private idCounter = 0;
  
  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }
  
  show(toast: Omit<ToastProps, 'id' | 'onDismiss'>): string {
    const id = `toast-${++this.idCounter}`;
    const newToast: ToastProps = {
      ...toast,
      id,
      onDismiss: this.dismiss.bind(this),
    };
    
    this.toasts = [...this.toasts, newToast];
    this.notifyListeners();
    
    return id;
  }
  
  dismiss = (id: string) => {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  };
  
  dismissAll() {
    this.toasts = [];
    this.notifyListeners();
  }
  
  subscribe(listener: (toasts: ToastProps[]) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener([...this.toasts]);
      } catch (error) {
        console.error('Toast listener error:', error);
      }
    });
  }
  
  // Convenience methods
  success(title: string, message?: string, options?: Partial<ToastProps>) {
    return this.show({ type: 'success', title, message, ...options });
  }
  
  error(title: string, message?: string, options?: Partial<ToastProps>) {
    return this.show({ type: 'error', title, message, duration: 6000, ...options });
  }
  
  warning(title: string, message?: string, options?: Partial<ToastProps>) {
    return this.show({ type: 'warning', title, message, ...options });
  }
  
  info(title: string, message?: string, options?: Partial<ToastProps>) {
    return this.show({ type: 'info', title, message, ...options });
  }
}

// Toast Container Component
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  
  useEffect(() => {
    const toastManager = ToastManager.getInstance();
    const unsubscribe = toastManager.subscribe(setToasts);
    
    return unsubscribe;
  }, []);
  
  if (toasts.length === 0) return null;
  
  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </View>
  );
}

// Hook for using toasts
export function useToast() {
  const toastManager = ToastManager.getInstance();
  
  return {
    show: toastManager.show.bind(toastManager),
    success: toastManager.success.bind(toastManager),
    error: toastManager.error.bind(toastManager),
    warning: toastManager.warning.bind(toastManager),
    info: toastManager.info.bind(toastManager),
    dismiss: toastManager.dismiss.bind(toastManager),
    dismissAll: toastManager.dismissAll.bind(toastManager),
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: width - 32,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default ToastManager;