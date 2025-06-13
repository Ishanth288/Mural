import { Platform } from 'react-native';

interface WebVitalsMetrics {
  CLS: number | null; // Cumulative Layout Shift
  FID: number | null; // First Input Delay
  FCP: number | null; // First Contentful Paint
  LCP: number | null; // Largest Contentful Paint
  TTFB: number | null; // Time to First Byte
  TTI: number | null; // Time to Interactive
}

interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

class WebVitalsTracker {
  private static instance: WebVitalsTracker;
  private metrics: WebVitalsMetrics = {
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null,
    TTI: null
  };
  
  private observers: PerformanceObserver[] = [];
  private callbacks: Array<(metrics: WebVitalsMetrics) => void> = [];
  
  static getInstance(): WebVitalsTracker {
    if (!WebVitalsTracker.instance) {
      WebVitalsTracker.instance = new WebVitalsTracker();
    }
    return WebVitalsTracker.instance;
  }
  
  startTracking(): void {
    if (Platform.OS !== 'web' || typeof PerformanceObserver === 'undefined') {
      console.warn('Web Vitals tracking not supported on this platform');
      return;
    }
    
    this.trackFCP();
    this.trackLCP();
    this.trackFID();
    this.trackCLS();
    this.trackTTFB();
    this.trackTTI();
  }
  
  stopTracking(): void {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Failed to disconnect performance observer:', error);
      }
    });
    this.observers = [];
  }
  
  private trackFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          this.metrics.FCP = fcpEntry.startTime;
          this.notifyCallbacks();
          observer.disconnect();
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to track FCP:', error);
    }
  }
  
  private trackLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          this.metrics.LCP = lastEntry.startTime;
          this.notifyCallbacks();
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to track LCP:', error);
    }
  }
  
  private trackFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        
        if (firstEntry) {
          this.metrics.FID = firstEntry.processingStart - firstEntry.startTime;
          this.notifyCallbacks();
          observer.disconnect();
        }
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to track FID:', error);
    }
  }
  
  private trackCLS(): void {
    try {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries: any[] = [];
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          if (!(entry as any).hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
            
            if (sessionValue && 
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += (entry as any).value;
              sessionEntries.push(entry);
            } else {
              sessionValue = (entry as any).value;
              sessionEntries = [entry];
            }
            
            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              this.metrics.CLS = clsValue;
              this.notifyCallbacks();
            }
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to track CLS:', error);
    }
  }
  
  private trackTTFB(): void {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
      
      if (navigationEntry) {
        this.metrics.TTFB = navigationEntry.responseStart - navigationEntry.requestStart;
        this.notifyCallbacks();
      }
    } catch (error) {
      console.warn('Failed to track TTFB:', error);
    }
  }
  
  private trackTTI(): void {
    try {
      // TTI is complex to calculate accurately
      // This is a simplified implementation
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        // Look for long tasks that might indicate the page is not interactive
        const longTasks = entries.filter(entry => entry.duration > 50);
        
        if (longTasks.length === 0 && this.metrics.FCP) {
          // Estimate TTI as FCP + some buffer if no long tasks
          this.metrics.TTI = this.metrics.FCP + 100;
          this.notifyCallbacks();
          observer.disconnect();
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
      
      // Fallback: set TTI after a reasonable delay
      setTimeout(() => {
        if (this.metrics.TTI === null && this.metrics.FCP) {
          this.metrics.TTI = this.metrics.FCP + 500;
          this.notifyCallbacks();
        }
      }, 5000);
    } catch (error) {
      console.warn('Failed to track TTI:', error);
    }
  }
  
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback({ ...this.metrics });
      } catch (error) {
        console.error('Web Vitals callback error:', error);
      }
    });
  }
  
  // Public API
  getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }
  
  onMetricsUpdate(callback: (metrics: WebVitalsMetrics) => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
  
  getPerformanceScore(): number {
    const { CLS, FID, FCP, LCP } = this.metrics;
    
    if (!CLS || !FID || !FCP || !LCP) {
      return 0; // Not enough data
    }
    
    // Scoring based on Google's thresholds
    const clsScore = CLS <= 0.1 ? 100 : CLS <= 0.25 ? 50 : 0;
    const fidScore = FID <= 100 ? 100 : FID <= 300 ? 50 : 0;
    const fcpScore = FCP <= 1800 ? 100 : FCP <= 3000 ? 50 : 0;
    const lcpScore = LCP <= 2500 ? 100 : LCP <= 4000 ? 50 : 0;
    
    return Math.round((clsScore + fidScore + fcpScore + lcpScore) / 4);
  }
  
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const { CLS, FID, FCP, LCP, TTFB } = this.metrics;
    
    if (CLS && CLS > 0.1) {
      recommendations.push('Reduce Cumulative Layout Shift by setting dimensions for images and ads');
    }
    
    if (FID && FID > 100) {
      recommendations.push('Improve First Input Delay by reducing JavaScript execution time');
    }
    
    if (FCP && FCP > 1800) {
      recommendations.push('Improve First Contentful Paint by optimizing critical resources');
    }
    
    if (LCP && LCP > 2500) {
      recommendations.push('Improve Largest Contentful Paint by optimizing images and fonts');
    }
    
    if (TTFB && TTFB > 600) {
      recommendations.push('Improve Time to First Byte by optimizing server response time');
    }
    
    return recommendations;
  }
  
  // Export metrics for analytics
  exportMetrics(): string {
    return JSON.stringify({
      ...this.metrics,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    });
  }
  
  // Send metrics to analytics service
  async sendToAnalytics(endpoint?: string): Promise<void> {
    if (Platform.OS !== 'web') return;
    
    const metricsData = this.exportMetrics();
    const url = endpoint || '/api/analytics/web-vitals';
    
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: metricsData,
      });
    } catch (error) {
      console.warn('Failed to send Web Vitals to analytics:', error);
    }
  }
}

export default WebVitalsTracker;
export type { WebVitalsMetrics };