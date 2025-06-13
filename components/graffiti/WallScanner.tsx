import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Scan, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import MuralText from '../ui/MuralText';

const { width, height } = Dimensions.get('window');

interface WallScannerProps {
  onWallDetected: (boundary: { x: number; y: number; width: number; height: number }) => void;
}

export default function WallScanner({ onWallDetected }: WallScannerProps) {
  const { colors } = useTheme();
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<'scanning' | 'complete'>('scanning');
  
  const scanLineAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    startWallScan();
  }, []);
  
  const startWallScan = () => {
    // Start scan line animation
    Animated.loop(
      Animated.timing(scanLineAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
    
    // Simulate wall detection process
    simulateWallDetection();
  };
  
  const simulateWallDetection = () => {
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = prev + 10;
        
        if (newProgress >= 100) {
          setScanPhase('complete');
          clearInterval(scanInterval);
          
          // Complete scan and return surface
          setTimeout(() => {
            onWallDetected({
              x: 50,
              y: 100,
              width: width - 100,
              height: height - 300
            });
          }, 1000);
        }
        
        return Math.min(100, newProgress);
      });
    }, 200);
  };

  return (
    <View style={styles.container}>
      {/* Scanning overlay */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.3)']}
        style={styles.scanOverlay}
      />
      
      {/* Scanning line */}
      <Animated.View
        style={[
          styles.scanLine,
          {
            transform: [{
              translateY: scanLineAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, height],
              }),
            }],
          }
        ]}
      >
        <LinearGradient
          colors={['transparent', colors.primary, 'transparent']}
          style={styles.scanLineGradient}
        />
      </Animated.View>
      
      {/* Scan status UI */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusCard, { backgroundColor: colors.glass }]}>
          <View style={styles.statusHeader}>
            {scanPhase === 'scanning' && <Scan size={24} color={colors.primary} />}
            {scanPhase === 'complete' && <CheckCircle size={24} color={colors.success} />}
            
            <MuralText variant="tagline" style={styles.statusTitle}>
              {scanPhase === 'scanning' ? 'Scanning Wall...' : 'Wall Detected!'}
            </MuralText>
          </View>
          
          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${scanProgress}%`,
                  backgroundColor: scanPhase === 'complete' ? colors.success : colors.primary
                }
              ]}
            />
          </View>
          
          <MuralText variant="subtitle" style={styles.progressText}>
            {scanProgress}% complete
          </MuralText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
  },
  scanLineGradient: {
    flex: 1,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    marginLeft: 8,
    fontSize: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
});