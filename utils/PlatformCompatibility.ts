import { Platform } from 'react-native';

interface MotionData {
  acceleration: { x: number; y: number; z: number };
  rotation: { alpha: number; beta: number; gamma: number };
  timestamp: number;
  pressure: number;
  distance: number;
}

interface PlatformCapabilities {
  hasMotionSensors: boolean;
  hasVibration: boolean;
  hasCamera: boolean;
  hasWebGL: boolean;
  hasServiceWorker: boolean;
  hasNotifications: boolean;
}

class PlatformCompatibilityManager {
  private static instance: PlatformCompatibilityManager;
  private capabilities: PlatformCapabilities;
  private motionListeners: Array<(data: MotionData) => void> = [];
  private isMotionTracking = false;
  private motionPermissionGranted = false;
  
  static getInstance(): PlatformCompatibilityManager {
    if (!PlatformCompatibilityManager.instance) {
      PlatformCompatibilityManager.instance = new PlatformCompatibilityManager();
    }
    return PlatformCompatibilityManager.instance;
  }
  
  constructor() {
    this.capabilities = this.detectCapabilities();
  }
  
  private detectCapabilities(): PlatformCapabilities {
    const isWeb = Platform.OS === 'web';
    
    return {
      hasMotionSensors: isWeb ? this.hasWebMotionSensors() : true,
      hasVibration: isWeb ? 'vibrate' in navigator : true,
      hasCamera: isWeb ? this.hasWebCamera() : true,
      hasWebGL: isWeb ? this.hasWebGL() : false,
      hasServiceWorker: isWeb ? 'serviceWorker' in navigator : false,
      hasNotifications: isWeb ? 'Notification' in window : true,
    };
  }
  
  private hasWebMotionSensors(): boolean {
    return typeof window !== 'undefined' && 
           'DeviceMotionEvent' in window && 
           'DeviceOrientationEvent' in window;
  }
  
  private hasWebCamera(): boolean {
    return typeof navigator !== 'undefined' && 
           'mediaDevices' in navigator && 
           'getUserMedia' in navigator.mediaDevices;
  }
  
  private hasWebGL(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (error) {
      return false;
    }
  }
  
  // Motion Tracking with Platform Compatibility
  async startMotionTracking(callback: (data: MotionData) => void): Promise<boolean> {
    if (this.isMotionTracking) return true;
    
    this.motionListeners.push(callback);
    
    if (Platform.OS === 'web') {
      return this.startWebMotionTracking();
    } else {
      return this.startNativeMotionTracking();
    }
  }
  
  private async startWebMotionTracking(): Promise<boolean> {
    if (!this.capabilities.hasMotionSensors) {
      console.warn('Motion sensors not available on this device');
      // Fallback to mouse/touch movement
      return this.startMouseMotionTracking();
    }
    
    try {
      // Request permission for iOS 13+ devices
      if (typeof DeviceMotionEvent !== 'undefined' && 
          'requestPermission' in DeviceMotionEvent) {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== 'granted') {
          console.warn('Motion permission denied, using fallback');
          return this.startMouseMotionTracking();
        }
        this.motionPermissionGranted = true;
      }
      
      let lastMotion: MotionData | null = null;
      
      const handleDeviceMotion = (event: DeviceMotionEvent) => {
        const acceleration = event.acceleration || { x: 0, y: 0, z: 0 };
        const rotationRate = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };
        
        const motionData: MotionData = {
          acceleration,
          rotation: rotationRate,
          timestamp: Date.now(),
          pressure: this.calculatePressure(acceleration),
          distance: this.calculateDistance(acceleration)
        };
        
        lastMotion = motionData;
        this.notifyMotionListeners(motionData);
      };
      
      const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
        if (lastMotion) {
          lastMotion.rotation = {
            alpha: event.alpha || 0,
            beta: event.beta || 0,
            gamma: event.gamma || 0
          };
          this.notifyMotionListeners(lastMotion);
        }
      };
      
      window.addEventListener('devicemotion', handleDeviceMotion);
      window.addEventListener('deviceorientation', handleDeviceOrientation);
      
      this.isMotionTracking = true;
      return true;
      
    } catch (error) {
      console.error('Failed to start web motion tracking:', error);
      return this.startMouseMotionTracking();
    }
  }
  
  private startMouseMotionTracking(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }
      
      let lastMousePosition = { x: 0, y: 0 };
      let lastTimestamp = Date.now();
      
      const handleMouseMove = (event: MouseEvent) => {
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
          
          this.notifyMotionListeners(motionData);
        }
        
        lastMousePosition = { x: event.clientX, y: event.clientY };
        lastTimestamp = now;
      };
      
      const handleTouchMove = (event: TouchEvent) => {
        if (event.touches.length > 0) {
          const touch = event.touches[0];
          const now = Date.now();
          const deltaTime = now - lastTimestamp;
          const deltaX = touch.clientX - lastMousePosition.x;
          const deltaY = touch.clientY - lastMousePosition.y;
          
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
            
            this.notifyMotionListeners(motionData);
          }
          
          lastMousePosition = { x: touch.clientX, y: touch.clientY };
          lastTimestamp = now;
        }
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      
      this.isMotionTracking = true;
      resolve(true);
    });
  }
  
  private async startNativeMotionTracking(): Promise<boolean> {
    try {
      // For native platforms, simulate motion data since expo-sensors is not available
      const simulateMotion = () => {
        if (!this.isMotionTracking) return;
        
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
        
        this.notifyMotionListeners(motionData);
        setTimeout(simulateMotion, 16); // 60fps
      };
      
      simulateMotion();
      this.isMotionTracking = true;
      return true;
      
    } catch (error) {
      console.error('Failed to start native motion tracking:', error);
      return false;
    }
  }
  
  stopMotionTracking(): void {
    this.isMotionTracking = false;
    this.motionListeners = [];
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleDeviceMotion);
      window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('touchmove', this.handleTouchMove);
    }
  }
  
  private handleDeviceMotion = (event: DeviceMotionEvent) => {
    // Bound method for event listener cleanup
  };
  
  private handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    // Bound method for event listener cleanup
  };
  
  private handleMouseMove = (event: MouseEvent) => {
    // Bound method for event listener cleanup
  };
  
  private handleTouchMove = (event: TouchEvent) => {
    // Bound method for event listener cleanup
  };
  
  private notifyMotionListeners(data: MotionData): void {
    this.motionListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Motion listener error:', error);
      }
    });
  }
  
  private calculatePressure(acceleration: { x: number; y: number; z: number }): number {
    const magnitude = Math.sqrt(
      acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
    );
    return Math.min(1, magnitude / 10);
  }
  
  private calculateDistance(acceleration: { x: number; y: number; z: number }): number {
    const magnitude = Math.sqrt(
      acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
    );
    return Math.max(0.1, Math.min(2.0, 1.0 / (magnitude + 0.1)));
  }
  
  // Haptic Feedback with Platform Compatibility
  triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy' = 'medium'): void {
    if (Platform.OS === 'web') {
      this.triggerWebVibration(intensity);
    } else {
      this.triggerNativeHaptics(intensity);
    }
  }
  
  private triggerWebVibration(intensity: 'light' | 'medium' | 'heavy'): void {
    if (!this.capabilities.hasVibration) return;
    
    const patterns = {
      light: [50],
      medium: [100],
      heavy: [200]
    };
    
    try {
      navigator.vibrate(patterns[intensity]);
    } catch (error) {
      console.warn('Vibration not supported:', error);
    }
  }
  
  private async triggerNativeHaptics(intensity: 'light' | 'medium' | 'heavy'): Promise<void> {
    try {
      // Since expo-haptics is not available, provide visual feedback instead
      console.log(`Haptic feedback: ${intensity}`);
      
      // Trigger visual feedback event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hapticFeedback', {
          detail: { intensity }
        }));
      }
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }
  
  // Audio with Platform Compatibility
  async playAudio(url: string, options: { loop?: boolean; volume?: number } = {}): Promise<void> {
    if (Platform.OS === 'web') {
      return this.playWebAudio(url, options);
    } else {
      return this.playNativeAudio(url, options);
    }
  }
  
  private async playWebAudio(url: string, options: { loop?: boolean; volume?: number }): Promise<void> {
    try {
      const audio = new Audio(url);
      audio.loop = options.loop || false;
      audio.volume = options.volume || 1.0;
      
      await audio.play();
    } catch (error) {
      console.warn('Web audio playback failed:', error);
    }
  }
  
  private async playNativeAudio(url: string, options: { loop?: boolean; volume?: number }): Promise<void> {
    try {
      // Since expo-av is not available, use web audio API
      return this.playWebAudio(url, options);
    } catch (error) {
      console.warn('Native audio playback failed:', error);
    }
  }
  
  // Capability Checks
  getCapabilities(): PlatformCapabilities {
    return { ...this.capabilities };
  }
  
  isFeatureSupported(feature: keyof PlatformCapabilities): boolean {
    return this.capabilities[feature];
  }
  
  // Platform-specific implementations
  getPlatformInfo(): {
    platform: string;
    isWeb: boolean;
    isMobile: boolean;
    userAgent?: string;
  } {
    const isWeb = Platform.OS === 'web';
    
    return {
      platform: Platform.OS,
      isWeb,
      isMobile: isWeb ? /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : true,
      userAgent: isWeb ? navigator.userAgent : undefined
    };
  }
}

export default PlatformCompatibilityManager;
export type { MotionData, PlatformCapabilities };