import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TriangleAlert as AlertTriangle, RefreshCw, Chrome as Home } from 'lucide-react-native';
import { router } from 'expo-router';
import MuralText from './MuralText';
import MuralButton from './MuralButton';
import GlassmorphicCard from './GlassmorphicCard';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    router.replace('/(tabs)');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <GlassmorphicCard style={styles.errorCard}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={48} color="#EF4444" />
            </View>
            
            <MuralText variant="logo" style={styles.title}>
              Something went wrong
            </MuralText>
            
            <MuralText variant="subtitle" style={styles.message}>
              We encountered an unexpected error. Don't worry, your work is safe.
            </MuralText>
            
            {__DEV__ && this.state.error && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}
            
            <View style={styles.actions}>
              <MuralButton
                title="Try Again"
                onPress={this.handleRetry}
                variant="primary"
                size="medium"
                icon={<RefreshCw size={20} color="white" />}
              />
              
              <TouchableOpacity 
                style={styles.homeButton}
                onPress={this.handleGoHome}
              >
                <Home size={20} color="#6366F1" />
                <Text style={styles.homeButtonText}>Go Home</Text>
              </TouchableOpacity>
            </View>
          </GlassmorphicCard>
        </View>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different components
export function GraffitiModeError() {
  return (
    <View style={styles.container}>
      <GlassmorphicCard style={styles.errorCard}>
        <AlertTriangle size={48} color="#F59E0B" />
        <MuralText variant="logo" style={styles.title}>
          AR Mode Unavailable
        </MuralText>
        <MuralText variant="subtitle" style={styles.message}>
          Camera or motion sensors are not available. Try 2D drawing mode instead.
        </MuralText>
        <MuralButton
          title="Use 2D Mode"
          onPress={() => router.push('/(tabs)/create')}
          variant="secondary"
          size="medium"
        />
      </GlassmorphicCard>
    </View>
  );
}

export function CameraError() {
  return (
    <View style={styles.container}>
      <GlassmorphicCard style={styles.errorCard}>
        <AlertTriangle size={48} color="#EF4444" />
        <MuralText variant="logo" style={styles.title}>
          Camera Access Required
        </MuralText>
        <MuralText variant="subtitle" style={styles.message}>
          Please enable camera permissions in your device settings to use AR features.
        </MuralText>
        <MuralButton
          title="Open Settings"
          onPress={() => {
            // Platform-specific settings opening would go here
          }}
          variant="primary"
          size="medium"
        />
      </GlassmorphicCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  errorCard: {
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
    color: '#F8FAFC',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    color: '#CBD5E1',
  },
  debugInfo: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#EF4444',
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
  },
  homeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6366F1',
    fontFamily: 'Inter-Medium',
  },
});