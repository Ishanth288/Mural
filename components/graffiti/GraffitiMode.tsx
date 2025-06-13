import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Platform
} from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  withTiming,
  useAnimatedReaction
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SprayCan as Spray, Volume2, VolumeX, RotateCcw, Palette, Layers, Settings, Users, Video, Zap } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import MuralText from '../ui/MuralText';
import MuralLogo from '../ui/MuralLogo';
import GraffitiCanvas from './GraffitiCanvas';
import SprayCanSelector from './SprayCanSelector';
import GraffitiColorPicker from './GraffitiColorPicker';
import MotionTracker from './MotionTracker';
import WallScanner from './WallScanner';
import ErrorBoundary, { GraffitiModeError } from '../ui/ErrorBoundary';
import LoadingState from '../ui/LoadingState';
import { useConfirmation } from '../ui/ConfirmationDialog';
import AccessibilityWrapper from '../ui/AccessibilityWrapper';

const { width, height } = Dimensions.get('window');

// High-frequency motion sampling for ultra-low latency
const MOTION_UPDATE_INTERVAL = 16; // 60Hz sampling (web-compatible)
const SPRAY_PHYSICS_INTERVAL = 16; // 60fps physics
const HAPTIC_INTENSITY = 0.8;

type SprayCanType = 'wide' | 'skinny' | 'fat' | 'detail' | 'chrome';
type GraffitiStyle = 'wildstyle' | 'bubble' | 'block' | 'throw-up' | 'tag';

interface SprayParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface MotionData {
  acceleration: { x: number; y: number; z: number };
  rotation: { alpha: number; beta: number; gamma: number };
  timestamp: number;
  pressure: number;
  distance: number;
}

type GraffitiModeProps = {
  isActive: boolean;
  onExit: () => void;
  facing: CameraType;
  onToggleFacing: () => void;
};

// Web-compatible motion detection
class WebMotionTracker {
  private callback: ((data: MotionData) => void) | null = null;
  private isTracking = false;
  private lastMotion: MotionData | null = null;
  
  start(callback: (data: MotionData) => void) {
    this.callback = callback;
    this.isTracking = true;
    
    if (Platform.OS === 'web') {
      this.startWebMotionTracking();
    } else {
      this.startNativeMotionTracking();
    }
  }
  
  stop() {
    this.isTracking = false;
    this.callback = null;
    
    if (Platform.OS === 'web') {
      window.removeEventListener('devicemotion', this.handleDeviceMotion);
      window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
    }
  }
  
  private startWebMotionTracking() {
    if (typeof window !== 'undefined') {
      // Check for motion sensor support
      if ('DeviceMotionEvent' in window) {
        window.addEventListener('devicemotion', this.handleDeviceMotion);
      }
      
      if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', this.handleDeviceOrientation);
      }
      
      // Fallback to mouse/touch movement for desktop
      this.startMouseMotionTracking();
    }
  }
  
  private startNativeMotionTracking() {
    // For native platforms, we'll simulate motion data
    this.simulateMotionData();
  }
  
  private handleDeviceMotion = (event: DeviceMotionEvent) => {
    if (!this.isTracking || !this.callback) return;
    
    const acceleration = event.acceleration || { x: 0, y: 0, z: 0 };
    const rotationRate = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };
    
    const motionData: MotionData = {
      acceleration,
      rotation: rotationRate,
      timestamp: Date.now(),
      pressure: this.calculatePressure(acceleration),
      distance: this.calculateDistance(acceleration)
    };
    
    this.lastMotion = motionData;
    this.callback(motionData);
  };
  
  private handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (!this.isTracking || !this.callback) return;
    
    const rotation = {
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0
    };
    
    if (this.lastMotion) {
      this.lastMotion.rotation = rotation;
      this.callback(this.lastMotion);
    }
  };
  
  private startMouseMotionTracking() {
    let lastMousePosition = { x: 0, y: 0 };
    let lastTimestamp = Date.now();
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!this.isTracking || !this.callback) return;
      
      const now = Date.now();
      const deltaTime = now - lastTimestamp;
      const deltaX = event.clientX - lastMousePosition.x;
      const deltaY = event.clientY - lastMousePosition.y;
      
      if (deltaTime > 0) {
        const velocityX = deltaX / deltaTime;
        const velocityY = deltaY / deltaTime;
        
        const motionData: MotionData = {
          acceleration: { x: velocityX * 10, y: velocityY * 10, z: 0 },
          rotation: { alpha: 0, beta: 0, gamma: 0 },
          timestamp: now,
          pressure: Math.min(1, Math.sqrt(velocityX * velocityX + velocityY * velocityY) / 10),
          distance: 1
        };
        
        this.callback(motionData);
      }
      
      lastMousePosition = { x: event.clientX, y: event.clientY };
      lastTimestamp = now;
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
    }
  }
  
  private simulateMotionData() {
    const interval = setInterval(() => {
      if (!this.isTracking || !this.callback) {
        clearInterval(interval);
        return;
      }
      
      const motionData: MotionData = {
        acceleration: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2
        },
        rotation: {
          alpha: Math.random() * 360,
          beta: Math.random() * 180 - 90,
          gamma: Math.random() * 180 - 90
        },
        timestamp: Date.now(),
        pressure: Math.random(),
        distance: 0.5 + Math.random() * 1.5
      };
      
      this.callback(motionData);
    }, MOTION_UPDATE_INTERVAL);
  }
  
  private calculatePressure(acceleration: { x: number; y: number; z: number }): number {
    const magnitude = Math.sqrt(
      acceleration.x * acceleration.x + 
      acceleration.y * acceleration.y + 
      acceleration.z * acceleration.z
    );
    return Math.min(1, magnitude / 10);
  }
  
  private calculateDistance(acceleration: { x: number; y: number; z: number }): number {
    const magnitude = Math.sqrt(
      acceleration.x * acceleration.x + 
      acceleration.y * acceleration.y + 
      acceleration.z * acceleration.z
    );
    return Math.max(0.1, Math.min(2.0, 1.0 / (magnitude + 0.1)));
  }
}

// Web-compatible audio system
class WebAudioSystem {
  private audioContext: AudioContext | null = null;
  private sprayBuffer: AudioBuffer | null = null;
  private shakeBuffer: AudioBuffer | null = null;
  private isEnabled = true;
  
  async initialize() {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.loadSounds();
    } catch (error) {
      console.warn('Web Audio not supported:', error);
    }
  }
  
  private async loadSounds() {
    // Create synthetic spray sound
    this.sprayBuffer = this.createSpraySound();
    this.shakeBuffer = this.createShakeSound();
  }
  
  private createSpraySound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise for spray sound
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / (sampleRate * 0.1));
    }
    
    return buffer;
  }
  
  private createShakeSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate rattle sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 10) * 0.5;
    }
    
    return buffer;
  }
  
  playSpraySound() {
    if (!this.isEnabled || !this.audioContext || !this.sprayBuffer) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.sprayBuffer;
    source.connect(this.audioContext.destination);
    source.start();
  }
  
  playShakeSound() {
    if (!this.isEnabled || !this.audioContext || !this.shakeBuffer) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.shakeBuffer;
    source.connect(this.audioContext.destination);
    source.start();
  }
  
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}

// Web-compatible haptic feedback
const triggerHapticFeedback = (intensity: number = 1) => {
  if (Platform.OS === 'web') {
    // Use Vibration API if available
    if ('vibrate' in navigator) {
      navigator.vibrate(Math.round(intensity * 100));
    }
  } else {
    // Use expo-haptics for native platforms
    try {
      const Haptics = require('expo-haptics');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }
};

export default function GraffitiMode({
  isActive,
  onExit,
  facing,
  onToggleFacing
}: GraffitiModeProps) {
  const { colors } = useTheme();
  const { confirm, ConfirmationComponent } = useConfirmation();
  
  // State management
  const [isScanning, setIsScanning] = useState(false);
  const [wallDetected, setWallDetected] = useState(false);
  const [selectedCan, setSelectedCan] = useState<SprayCanType>('wide');
  const [selectedColor, setSelectedColor] = useState('#FF0080');
  const [isRecording, setIsRecording] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [collaborativeMode, setCollaborativeMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Motion tracking state
  const [motionData, setMotionData] = useState<MotionData | null>(null);
  const [canPressure, setCanPressure] = useState(0);
  const [sprayActive, setSprayActive] = useState(false);
  const [particles, setParticles] = useState<SprayParticle[]>([]);
  
  // Refs for performance
  const motionTracker = useRef(new WebMotionTracker());
  const audioSystem = useRef(new WebAudioSystem());
  const motionBuffer = useRef<MotionData[]>([]);
  const lastMotionTime = useRef(0);
  const paintAccumulation = useRef(new Map<string, number>());
  const particlePool = useRef<SprayParticle[]>([]);
  
  // Animated values
  const sprayIntensity = useSharedValue(0);
  const canRotation = useSharedValue(0);
  const wallBoundary = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });
  const motionSmoothing = useSharedValue({ x: 0, y: 0 });
  
  // Initialize systems
  useEffect(() => {
    if (!isActive) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Initialize audio system
      audioSystem.current.initialize();
      
      // Start motion tracking
      motionTracker.current.start(handleMotionUpdate);
      
      // Start physics loop with optimized performance
      const physicsInterval = setInterval(updateSprayPhysics, SPRAY_PHYSICS_INTERVAL);
      
      setLoading(false);
      
      // Cleanup function
      return () => {
        motionTracker.current.stop();
        clearInterval(physicsInterval);
        cleanupParticles();
      };
    } catch (err) {
      setError('Failed to initialize graffiti mode');
      setLoading(false);
    }
  }, [isActive]);
  
  // Optimized motion handling with debouncing
  const handleMotionUpdate = (data: MotionData) => {
    const now = Date.now();
    if (now - lastMotionTime.current < MOTION_UPDATE_INTERVAL) return;
    
    try {
      // Apply motion smoothing
      const smoothedData = applyMotionSmoothing(data);
      
      // Update pressure based on motion intensity
      const intensity = Math.sqrt(
        smoothedData.acceleration.x ** 2 + 
        smoothedData.acceleration.y ** 2 + 
        smoothedData.acceleration.z ** 2
      );
      
      if (intensity > 2.5) {
        handleCanShake();
      }
      
      // Update motion buffer with circular array for memory efficiency
      motionBuffer.current.push(smoothedData);
      if (motionBuffer.current.length > 10) {
        motionBuffer.current.shift();
      }
      
      setMotionData(smoothedData);
      lastMotionTime.current = now;
    } catch (err) {
      console.warn('Motion tracking error:', err);
    }
  };
  
  const applyMotionSmoothing = (data: MotionData): MotionData => {
    const buffer = motionBuffer.current;
    if (buffer.length === 0) return data;
    
    const alpha = 0.7; // Smoothing factor
    const lastData = buffer[buffer.length - 1];
    
    return {
      ...data,
      acceleration: {
        x: alpha * data.acceleration.x + (1 - alpha) * lastData.acceleration.x,
        y: alpha * data.acceleration.y + (1 - alpha) * lastData.acceleration.y,
        z: alpha * data.acceleration.z + (1 - alpha) * lastData.acceleration.z
      }
    };
  };
  
  const handleCanShake = () => {
    setCanPressure(prev => Math.min(1.0, prev + 0.2));
    
    // Play shake sound
    if (soundEnabled) {
      audioSystem.current.playShakeSound();
    }
    
    // Haptic feedback
    triggerHapticFeedback(0.5);
  };
  
  const activateSpray = () => {
    if (!sprayActive && canPressure > 0.1) {
      setSprayActive(true);
      sprayIntensity.value = withSpring(1);
      
      // Start spray sound
      if (soundEnabled) {
        audioSystem.current.playSpraySound();
      }
      
      // Generate spray particles with object pooling
      generateSprayParticles();
    }
  };
  
  const deactivateSpray = () => {
    if (sprayActive) {
      setSprayActive(false);
      sprayIntensity.value = withSpring(0);
    }
  };
  
  // Optimized particle system with object pooling
  const generateSprayParticles = () => {
    if (!motionData || !sprayActive) return;
    
    const particleCount = Math.min(20, Math.floor(canPressure * 30)); // Limit particles for performance
    const newParticles: SprayParticle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Reuse particles from pool if available
      let particle = particlePool.current.pop();
      
      if (!particle) {
        particle = {
          id: '',
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          size: 0,
          opacity: 0,
          color: '',
          life: 0,
          maxLife: 0
        };
      }
      
      // Reset particle properties
      const angle = (Math.random() - 0.5) * Math.PI / 4;
      const speed = canPressure * 3 + Math.random() * 2;
      const size = getSpraySize(selectedCan, motionData.distance);
      
      particle.id = `${Date.now()}-${i}`;
      particle.x = width / 2 + (Math.random() - 0.5) * 20;
      particle.y = height / 2 + (Math.random() - 0.5) * 20;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.size = size;
      particle.opacity = canPressure;
      particle.color = selectedColor;
      particle.life = 0;
      particle.maxLife = 30 + Math.random() * 20; // Shorter life for performance
      
      newParticles.push(particle);
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  };
  
  const getSpraySize = (canType: SprayCanType, distance: number) => {
    const baseSize = {
      wide: 12,
      skinny: 2,
      fat: 20,
      detail: 1,
      chrome: 10
    }[canType];
    
    return baseSize * (1 + distance * 0.3);
  };
  
  // Optimized physics update with performance monitoring
  const updateSprayPhysics = () => {
    setParticles(prev => {
      const activeParticles = prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.05, // Reduced gravity for performance
          life: particle.life + 1,
          opacity: particle.opacity * (1 - particle.life / particle.maxLife)
        }))
        .filter(particle => {
          const isAlive = particle.life < particle.maxLife && 
                          particle.x > -50 && particle.x < width + 50 &&
                          particle.y > -50 && particle.y < height + 50;
          
          // Return dead particles to pool
          if (!isAlive) {
            particlePool.current.push(particle);
          }
          
          return isAlive;
        });
      
      return activeParticles;
    });
    
    // Decrease can pressure over time
    setCanPressure(prev => Math.max(0, prev - 0.003));
  };
  
  const cleanupParticles = () => {
    setParticles([]);
    particlePool.current = [];
    paintAccumulation.current.clear();
  };
  
  // Wall scanning
  const startWallScan = () => {
    setIsScanning(true);
    setError(null);
    
    setTimeout(() => {
      setWallDetected(true);
      setIsScanning(false);
      wallBoundary.value = {
        x: 50,
        y: 100,
        width: width - 100,
        height: height - 200
      };
    }, 3000);
  };
  
  const handleExit = async () => {
    if (particles.length > 0) {
      const shouldExit = await confirm({
        title: 'Exit Graffiti Mode?',
        message: 'Your current artwork will be lost. Are you sure you want to exit?',
        type: 'warning',
        destructive: true
      });
      
      if (!shouldExit) return;
    }
    
    cleanupParticles();
    onExit();
  };
  
  const handleClearCanvas = async () => {
    const shouldClear = await confirm({
      title: 'Clear Canvas?',
      message: 'This will remove all your current artwork. This action cannot be undone.',
      type: 'warning',
      destructive: true
    });
    
    if (shouldClear) {
      setParticles([]);
      paintAccumulation.current.clear();
    }
  };
  
  // Gesture handlers
  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (canPressure > 0.1) {
        runOnJS(activateSpray)();
      }
    })
    .onUpdate((event) => {
      motionSmoothing.value = {
        x: event.x,
        y: event.y
      };
    })
    .onEnd(() => {
      runOnJS(deactivateSpray)();
    });
  
  // Animated styles
  const sprayIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: sprayIntensity.value,
      transform: [
        { scale: interpolate(sprayIntensity.value, [0, 1], [0.5, 1.2]) }
      ]
    };
  });
  
  const canRotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${canRotation.value}deg` }]
    };
  });
  
  if (!isActive) return null;
  
  if (loading) {
    return <LoadingState variant="fullscreen" message="Initializing Graffiti Mode..." showLogo />;
  }
  
  if (error) {
    return <GraffitiModeError />;
  }

  return (
    <ErrorBoundary fallback={<GraffitiModeError />}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Camera View with AR overlay */}
        <CameraView style={styles.camera} facing={facing}>
          {/* Wall Scanner Overlay */}
          {isScanning && (
            <WallScanner
              onWallDetected={(boundary) => {
                setWallDetected(true);
                setIsScanning(false);
                wallBoundary.value = boundary;
              }}
            />
          )}
          
          {/* Motion Tracker */}
          <MotionTracker
            motionData={motionData}
            isActive={sprayActive}
            onMotionUpdate={setMotionData}
          />
          
          {/* Graffiti Canvas */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={styles.canvasContainer}>
              <GraffitiCanvas
                particles={particles}
                wallBoundary={wallBoundary.value}
                sprayActive={sprayActive}
                selectedColor={selectedColor}
                canType={selectedCan}
                motionData={motionData}
              />
            </Animated.View>
          </GestureDetector>
          
          {/* Spray Indicator */}
          <Animated.View style={[styles.sprayIndicator, sprayIndicatorStyle]}>
            <LinearGradient
              colors={[selectedColor + '80', selectedColor + '20']}
              style={styles.sprayGradient}
            />
          </Animated.View>
          
          {/* Pressure Gauge */}
          <View style={styles.pressureGauge}>
            <GlassmorphicCard style={styles.pressureCard}>
              <MuralText variant="subtitle" style={styles.pressureLabel}>
                Pressure
              </MuralText>
              <View style={styles.pressureBar}>
                <View 
                  style={[
                    styles.pressureFill,
                    { 
                      width: `${canPressure * 100}%`,
                      backgroundColor: canPressure > 0.7 ? colors.success : 
                                     canPressure > 0.3 ? colors.warning : colors.error
                    }
                  ]}
                />
              </View>
              <MuralText variant="subtitle" style={styles.pressureText}>
                {Math.round(canPressure * 100)}%
              </MuralText>
            </GlassmorphicCard>
          </View>
          
          {/* Virtual Spray Can */}
          <Animated.View style={[styles.virtualCan, canRotationStyle]}>
            <Spray size={40} color={selectedColor} />
          </Animated.View>
          
          {/* Graffiti Controls */}
          <View style={styles.controls}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              <AccessibilityWrapper
                label="Exit graffiti mode"
                role="button"
              >
                <TouchableOpacity 
                  style={styles.exitButton}
                  onPress={handleExit}
                  accessibilityRole="button"
                  accessibilityLabel="Exit graffiti mode"
                >
                  <MuralText variant="tagline" style={{ color: colors.error }}>
                    Exit Graffiti Mode
                  </MuralText>
                </TouchableOpacity>
              </AccessibilityWrapper>
              
              <View style={styles.topRightControls}>
                <AccessibilityWrapper
                  label={isRecording ? "Stop recording" : "Start recording"}
                  role="button"
                  state={{ selected: isRecording }}
                >
                  <TouchableOpacity 
                    style={[styles.controlButton, { backgroundColor: colors.warning }]}
                    onPress={() => setIsRecording(!isRecording)}
                    accessibilityRole="button"
                  >
                    <Video size={20} color="white" />
                  </TouchableOpacity>
                </AccessibilityWrapper>
                
                <AccessibilityWrapper
                  label={collaborativeMode ? "Disable collaborative mode" : "Enable collaborative mode"}
                  role="button"
                  state={{ selected: collaborativeMode }}
                >
                  <TouchableOpacity 
                    style={[styles.controlButton, { backgroundColor: colors.secondary }]}
                    onPress={() => setCollaborativeMode(!collaborativeMode)}
                    accessibilityRole="button"
                  >
                    <Users size={20} color="white" />
                  </TouchableOpacity>
                </AccessibilityWrapper>
              </View>
            </View>
            
            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              {!wallDetected ? (
                <AccessibilityWrapper
                  label={isScanning ? "Scanning wall..." : "Scan wall to start painting"}
                  role="button"
                  state={{ disabled: isScanning }}
                >
                  <TouchableOpacity 
                    style={[styles.scanButton, { backgroundColor: colors.primary }]}
                    onPress={startWallScan}
                    disabled={isScanning}
                    accessibilityRole="button"
                  >
                    <Zap size={24} color="white" />
                    <MuralText variant="tagline" style={styles.scanButtonText}>
                      {isScanning ? 'Scanning Wall...' : 'Scan Wall'}
                    </MuralText>
                  </TouchableOpacity>
                </AccessibilityWrapper>
              ) : (
                <View style={styles.graffitiTools}>
                  <SprayCanSelector
                    selectedCan={selectedCan}
                    onSelectCan={setSelectedCan}
                    pressure={canPressure}
                  />
                  
                  <GraffitiColorPicker
                    selectedColor={selectedColor}
                    onSelectColor={setSelectedColor}
                  />
                  
                  <AccessibilityWrapper
                    label={soundEnabled ? "Disable sound" : "Enable sound"}
                    role="button"
                    state={{ selected: soundEnabled }}
                  >
                    <TouchableOpacity 
                      style={[styles.toolButton, { backgroundColor: colors.accent }]}
                      onPress={() => {
                        setSoundEnabled(!soundEnabled);
                        audioSystem.current.setEnabled(!soundEnabled);
                      }}
                      accessibilityRole="button"
                    >
                      {soundEnabled ? (
                        <Volume2 size={20} color="white" />
                      ) : (
                        <VolumeX size={20} color="white" />
                      )}
                    </TouchableOpacity>
                  </AccessibilityWrapper>
                  
                  <AccessibilityWrapper
                    label="Clear canvas"
                    role="button"
                  >
                    <TouchableOpacity 
                      style={[styles.toolButton, { backgroundColor: colors.warning }]}
                      onPress={handleClearCanvas}
                      accessibilityRole="button"
                    >
                      <RotateCcw size={20} color="white" />
                    </TouchableOpacity>
                  </AccessibilityWrapper>
                </View>
              )}
            </View>
          </View>
          
          {/* Mural Branding */}
          <View style={styles.brandWatermark}>
            <MuralLogo size={16} color="rgba(255, 255, 255, 0.3)" />
            <MuralText variant="subtitle" style={styles.watermarkText}>
              Graffiti Mode
            </MuralText>
          </View>
        </CameraView>
        
        <ConfirmationComponent />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  canvasContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  sprayIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 100,
    height: 100,
    marginTop: -50,
    marginLeft: -50,
    borderRadius: 50,
    pointerEvents: 'none',
  },
  sprayGradient: {
    flex: 1,
    borderRadius: 50,
  },
  pressureGauge: {
    position: 'absolute',
    top: 120,
    left: 16,
    width: 120,
  },
  pressureCard: {
    padding: 12,
    alignItems: 'center',
  },
  pressureLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  pressureBar: {
    width: 80,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  pressureFill: {
    height: '100%',
    borderRadius: 4,
  },
  pressureText: {
    fontSize: 10,
  },
  virtualCan: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
  },
  exitButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minHeight: 44, // Accessibility: minimum touch target
    justifyContent: 'center',
  },
  topRightControls: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 44, // Accessibility: minimum touch target
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  bottomControls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 16,
    right: 16,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    minHeight: 56, // Accessibility: larger touch target for primary action
  },
  scanButtonText: {
    marginLeft: 8,
    color: 'white',
    fontSize: 16,
  },
  graffitiTools: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandWatermark: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  watermarkText: {
    marginLeft: 6,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});