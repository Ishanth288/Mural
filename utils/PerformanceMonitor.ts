import { Platform } from 'react-native';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  networkLatency: number;
  batteryLevel?: number;
  deviceTemperature?: number;
}

interface PerformanceThresholds {
  minFPS: number;
  maxMemoryUsage: number;
  maxRenderTime: number;
  maxNetworkLatency: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private frameCount = 0;
  private lastFrameTime = 0;
  private fpsHistory: number[] = [];
  private memoryHistory: number[] = [];
  private renderTimeHistory: number[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  
  private readonly thresholds: PerformanceThresholds = {
    minFPS: 30,
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxRenderTime: 16.67, // 60fps target
    maxNetworkLatency: 1000 // 1 second
  };
  
  private performanceCallbacks: Array<(metrics: PerformanceMetrics) => void> = [];
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    
    // Start FPS monitoring
    this.startFPSMonitoring();
    
    // Start periodic metrics collection
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 1000); // Collect metrics every second
  }
  
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  
  private startFPSMonitoring(): void {
    const measureFPS = () => {
      if (!this.isMonitoring) return;
      
      const currentTime = performance.now();
      this.frameCount++;
      
      // Calculate FPS every second
      if (currentTime - this.lastFrameTime >= 1000) {
        const fps = this.frameCount;
        this.fpsHistory.push(fps);
        
        // Keep only last 60 seconds of data
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift();
        }
        
        // Auto-adjust quality if FPS drops
        if (fps < this.thresholds.minFPS) {
          this.handleLowFPS(fps);
        }
        
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }
  
  private async collectMetrics(): Promise<void> {
    try {
      const metrics: PerformanceMetrics = {
        fps: this.getCurrentFPS(),
        memoryUsage: await this.getMemoryUsage(),
        renderTime: this.getAverageRenderTime(),
        networkLatency: await this.measureNetworkLatency(),
        batteryLevel: await this.getBatteryLevel(),
        deviceTemperature: await this.getDeviceTemperature()
      };
      
      // Store metrics history
      this.memoryHistory.push(metrics.memoryUsage);
      if (this.memoryHistory.length > 60) {
        this.memoryHistory.shift();
      }
      
      // Notify callbacks
      this.performanceCallbacks.forEach(callback => {
        try {
          callback(metrics);
        } catch (error) {
          console.error('Performance callback error:', error);
        }
      });
      
      // Check for performance issues
      this.checkPerformanceThresholds(metrics);
      
    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
    }
  }
  
  private getCurrentFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory[this.fpsHistory.length - 1];
  }
  
  private async getMemoryUsage(): Promise<number> {
    if (Platform.OS === 'web' && 'memory' in performance) {
      const memInfo = (performance as any).memory;
      return memInfo.usedJSHeapSize || 0;
    }
    
    // For native platforms, estimate based on app state
    return 50 * 1024 * 1024; // 50MB estimate
  }
  
  private getAverageRenderTime(): number {
    if (this.renderTimeHistory.length === 0) return 16.67;
    
    const sum = this.renderTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.renderTimeHistory.length;
  }
  
  private async measureNetworkLatency(): Promise<number> {
    try {
      const startTime = performance.now();
      
      // Use a lightweight endpoint or ping service
      await fetch('https://httpbin.org/get', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      return performance.now() - startTime;
    } catch (error) {
      return 9999; // High latency on error
    }
  }
  
  private async getBatteryLevel(): Promise<number | undefined> {
    if (Platform.OS === 'web' && 'getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return battery.level * 100;
      } catch (error) {
        return undefined;
      }
    }
    
    return undefined;
  }
  
  private async getDeviceTemperature(): Promise<number | undefined> {
    // Device temperature is not available through standard web APIs
    // This would require native implementation
    return undefined;
  }
  
  private handleLowFPS(fps: number): void {
    console.warn(`Low FPS detected: ${fps}fps`);
    
    // Auto-adjust quality settings
    this.adjustQualitySettings(fps);
    
    // Trigger garbage collection hint
    this.triggerGarbageCollection();
  }
  
  private adjustQualitySettings(fps: number): void {
    const qualityLevel = fps < 20 ? 'low' : fps < 40 ? 'medium' : 'high';
    
    // Emit quality adjustment event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adjustQuality', {
        detail: { level: qualityLevel, fps }
      }));
    }
  }
  
  private triggerGarbageCollection(): void {
    if (Platform.OS === 'web' && 'gc' in window) {
      try {
        (window as any).gc();
      } catch (error) {
        // GC not available
      }
    }
  }
  
  private checkPerformanceThresholds(metrics: PerformanceMetrics): void {
    const issues: string[] = [];
    
    if (metrics.fps < this.thresholds.minFPS) {
      issues.push(`Low FPS: ${metrics.fps}`);
    }
    
    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      issues.push(`High memory usage: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`);
    }
    
    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      issues.push(`Slow rendering: ${metrics.renderTime.toFixed(2)}ms`);
    }
    
    if (metrics.networkLatency > this.thresholds.maxNetworkLatency) {
      issues.push(`High latency: ${metrics.networkLatency.toFixed(0)}ms`);
    }
    
    if (issues.length > 0) {
      console.warn('Performance issues detected:', issues);
      
      // Emit performance warning event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('performanceWarning', {
          detail: { issues, metrics }
        }));
      }
    }
  }
  
  // Public API
  onPerformanceUpdate(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.performanceCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.performanceCallbacks.indexOf(callback);
      if (index > -1) {
        this.performanceCallbacks.splice(index, 1);
      }
    };
  }
  
  getPerformanceReport(): {
    averageFPS: number;
    averageMemory: number;
    averageRenderTime: number;
    performanceScore: number;
  } {
    const avgFPS = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length 
      : 60;
      
    const avgMemory = this.memoryHistory.length > 0
      ? this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length
      : 0;
      
    const avgRenderTime = this.getAverageRenderTime();
    
    // Calculate performance score (0-100)
    const fpsScore = Math.min(100, (avgFPS / 60) * 100);
    const memoryScore = Math.max(0, 100 - (avgMemory / this.thresholds.maxMemoryUsage) * 100);
    const renderScore = Math.max(0, 100 - (avgRenderTime / this.thresholds.maxRenderTime) * 100);
    
    const performanceScore = (fpsScore + memoryScore + renderScore) / 3;
    
    return {
      averageFPS: Math.round(avgFPS),
      averageMemory: Math.round(avgMemory / 1024 / 1024), // MB
      averageRenderTime: Math.round(avgRenderTime * 100) / 100,
      performanceScore: Math.round(performanceScore)
    };
  }
  
  recordRenderTime(startTime: number): void {
    const renderTime = performance.now() - startTime;
    this.renderTimeHistory.push(renderTime);
    
    // Keep only last 100 render times
    if (this.renderTimeHistory.length > 100) {
      this.renderTimeHistory.shift();
    }
  }
  
  // Memory management utilities
  clearCaches(): void {
    // Clear various caches to free memory
    if (Platform.OS === 'web') {
      // Clear image caches
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.src.startsWith('blob:')) {
          URL.revokeObjectURL(img.src);
        }
      });
    }
    
    // Emit cache clear event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('clearCaches'));
    }
  }
  
  optimizeForLowMemory(): void {
    console.log('Optimizing for low memory conditions');
    
    // Reduce quality settings
    this.adjustQualitySettings(20);
    
    // Clear caches
    this.clearCaches();
    
    // Trigger garbage collection
    this.triggerGarbageCollection();
    
    // Emit low memory event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lowMemory'));
    }
  }
}

export default PerformanceMonitor;
export type { PerformanceMetrics, PerformanceThresholds };