import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Video, Square, Play, Pause, Download, Share2, Settings } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import MuralText from '../ui/MuralText';
import MuralButton from '../ui/MuralButton';
import AccessibilityWrapper from '../ui/AccessibilityWrapper';

interface TimelapseFrame {
  timestamp: number;
  canvasData: string;
  motionData?: any;
  audioData?: ArrayBuffer;
}

interface ARTimelapseRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSaveTimelapse: (frames: TimelapseFrame[]) => void;
  canvasRef: React.RefObject<any>;
}

export default function ARTimelapseRecorder({
  isRecording,
  onStartRecording,
  onStopRecording,
  onSaveTimelapse,
  canvasRef
}: ARTimelapseRecorderProps) {
  const { colors } = useTheme();
  const [frames, setFrames] = useState<TimelapseFrame[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [frameRate, setFrameRate] = useState(12); // 12 FPS for smooth timelapse
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [showSettings, setShowSettings] = useState(false);
  
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (isRecording) {
      startRecording();
      startPulseAnimation();
    } else {
      stopRecording();
      stopPulseAnimation();
    }
    
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording]);
  
  const startRecording = () => {
    startTime.current = Date.now();
    setFrames([]);
    setRecordingDuration(0);
    
    // Capture frames at specified frame rate
    const captureInterval = 1000 / frameRate;
    recordingInterval.current = setInterval(() => {
      captureFrame();
      updateRecordingDuration();
    }, captureInterval);
  };
  
  const stopRecording = () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
    
    if (frames.length > 0) {
      onSaveTimelapse(frames);
    }
  };
  
  const captureFrame = async () => {
    if (!canvasRef.current) return;
    
    try {
      // Capture canvas data - in a real implementation, this would capture the actual canvas
      const canvasData = await captureCanvasData();
      
      const frame: TimelapseFrame = {
        timestamp: Date.now() - startTime.current,
        canvasData,
        motionData: null, // Could capture motion data here
        audioData: undefined // Could capture audio here
      };
      
      setFrames(prev => [...prev, frame]);
    } catch (error) {
      console.error('Failed to capture frame:', error);
    }
  };
  
  const captureCanvasData = async (): Promise<string> => {
    // Simulate canvas capture - replace with actual implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return base64 encoded image data
        resolve(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`);
      }, 10);
    });
  };
  
  const updateRecordingDuration = () => {
    const duration = Date.now() - startTime.current;
    setRecordingDuration(duration);
  };
  
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
  const stopPulseAnimation = () => {
    pulseAnimation.stopAnimation();
    Animated.timing(pulseAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleToggleRecording = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };
  
  const handleSaveTimelapse = () => {
    if (frames.length > 0) {
      onSaveTimelapse(frames);
    }
  };
  
  const handleShareTimelapse = () => {
    // Implement sharing functionality
    console.log('Sharing timelapse with', frames.length, 'frames');
  };
  
  const getQualitySettings = () => {
    const settings = {
      low: { width: 480, height: 640, compression: 0.6 },
      medium: { width: 720, height: 1280, compression: 0.8 },
      high: { width: 1080, height: 1920, compression: 0.9 }
    };
    return settings[quality];
  };

  return (
    <View style={styles.container}>
      <GlassmorphicCard style={styles.recorderPanel}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Video size={20} color={colors.warning} />
            <MuralText variant="tagline" style={styles.title}>
              Timelapse
            </MuralText>
          </View>
          
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings(!showSettings)}
            accessibilityLabel="Timelapse settings"
            accessibilityRole="button"
          >
            <Settings size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Recording Status */}
        <View style={styles.statusContainer}>
          <Animated.View 
            style={[
              styles.recordingIndicator,
              {
                backgroundColor: isRecording ? colors.error : colors.textMuted,
                transform: [{ scale: isRecording ? pulseAnimation : 1 }]
              }
            ]}
          />
          
          <View style={styles.statusInfo}>
            <MuralText variant="subtitle" style={styles.statusText}>
              {isRecording ? 'Recording' : 'Ready'}
            </MuralText>
            <MuralText variant="subtitle" style={styles.durationText}>
              {formatDuration(recordingDuration)}
            </MuralText>
          </View>
          
          <MuralText variant="subtitle" style={styles.frameCount}>
            {frames.length} frames
          </MuralText>
        </View>
        
        {/* Settings Panel */}
        {showSettings && (
          <View style={styles.settingsPanel}>
            <View style={styles.settingRow}>
              <MuralText variant="subtitle" style={styles.settingLabel}>
                Frame Rate:
              </MuralText>
              <View style={styles.frameRateOptions}>
                {[6, 12, 24].map(rate => (
                  <TouchableOpacity
                    key={rate}
                    style={[
                      styles.frameRateOption,
                      frameRate === rate && { backgroundColor: colors.primary + '30' }
                    ]}
                    onPress={() => setFrameRate(rate)}
                  >
                    <MuralText variant="subtitle" style={styles.frameRateText}>
                      {rate}fps
                    </MuralText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.settingRow}>
              <MuralText variant="subtitle" style={styles.settingLabel}>
                Quality:
              </MuralText>
              <View style={styles.qualityOptions}>
                {(['low', 'medium', 'high'] as const).map(q => (
                  <TouchableOpacity
                    key={q}
                    style={[
                      styles.qualityOption,
                      quality === q && { backgroundColor: colors.secondary + '30' }
                    ]}
                    onPress={() => setQuality(q)}
                  >
                    <MuralText variant="subtitle" style={styles.qualityText}>
                      {q.charAt(0).toUpperCase() + q.slice(1)}
                    </MuralText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
        
        {/* Controls */}
        <View style={styles.controls}>
          <AccessibilityWrapper
            label={isRecording ? "Stop recording timelapse" : "Start recording timelapse"}
            role="button"
          >
            <TouchableOpacity
              style={[
                styles.recordButton,
                { backgroundColor: isRecording ? colors.error : colors.success }
              ]}
              onPress={handleToggleRecording}
              accessibilityRole="button"
            >
              {isRecording ? (
                <Square size={24} color="white" />
              ) : (
                <Video size={24} color="white" />
              )}
            </TouchableOpacity>
          </AccessibilityWrapper>
          
          {frames.length > 0 && !isRecording && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveTimelapse}
                accessibilityLabel="Save timelapse"
                accessibilityRole="button"
              >
                <Download size={20} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                onPress={handleShareTimelapse}
                accessibilityLabel="Share timelapse"
                accessibilityRole="button"
              >
                <Share2 size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Preview */}
        {frames.length > 0 && !isRecording && (
          <View style={styles.preview}>
            <MuralText variant="subtitle" style={styles.previewLabel}>
              Preview
            </MuralText>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={() => {
                // Play preview of timelapse
                console.log('Playing timelapse preview');
              }}
              accessibilityLabel="Play timelapse preview"
              accessibilityRole="button"
            >
              <Play size={32} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </GlassmorphicCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 200,
    left: 16,
    width: 240,
  },
  recorderPanel: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 8,
    fontSize: 16,
  },
  settingsButton: {
    padding: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  durationText: {
    fontSize: 10,
    opacity: 0.7,
  },
  frameCount: {
    fontSize: 10,
    opacity: 0.7,
  },
  settingsPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  settingRow: {
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  frameRateOptions: {
    flexDirection: 'row',
  },
  frameRateOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  frameRateText: {
    fontSize: 10,
  },
  qualityOptions: {
    flexDirection: 'row',
  },
  qualityOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  qualityText: {
    fontSize: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  preview: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  previewLabel: {
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.7,
  },
  previewButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});