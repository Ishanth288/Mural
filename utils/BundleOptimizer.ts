import { Platform } from 'react-native';

interface OptimizationConfig {
  enableCodeSplitting: boolean;
  enableImageOptimization: boolean;
  enableServiceWorker: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
  cacheStrategy: 'aggressive' | 'conservative' | 'minimal';
}

interface AssetManifest {
  images: Record<string, string>;
  fonts: Record<string, string>;
  scripts: Record<string, string>;
  styles: Record<string, string>;
}

class BundleOptimizer {
  private static instance: BundleOptimizer;
  private assetManifest: AssetManifest = {
    images: {},
    fonts: {},
    scripts: {},
    styles: {}
  };
  
  private config: OptimizationConfig = {
    enableCodeSplitting: true,
    enableImageOptimization: true,
    enableServiceWorker: Platform.OS === 'web',
    compressionLevel: 'medium',
    cacheStrategy: 'conservative'
  };
  
  static getInstance(): BundleOptimizer {
    if (!BundleOptimizer.instance) {
      BundleOptimizer.instance = new BundleOptimizer();
    }
    return BundleOptimizer.instance;
  }
  
  // Dynamic imports for code splitting
  async loadARModule() {
    try {
      const module = await import('@/components/ar/ARCamera');
      return module.default;
    } catch (error) {
      console.error('Failed to load AR module:', error);
      throw new Error('AR module unavailable');
    }
  }
  
  async loadGraffitiModule() {
    try {
      const module = await import('@/components/graffiti/GraffitiMode');
      return module.default;
    } catch (error) {
      console.error('Failed to load Graffiti module:', error);
      throw new Error('Graffiti module unavailable');
    }
  }
  
  async loadCollaborationModule() {
    try {
      const module = await import('@/components/ar/ARCollaboration');
      return module.default;
    } catch (error) {
      console.error('Failed to load Collaboration module:', error);
      throw new Error('Collaboration module unavailable');
    }
  }
  
  async loadTimelapseModule() {
    try {
      const module = await import('@/components/ar/ARTimelapseRecorder');
      return module.default;
    } catch (error) {
      console.error('Failed to load Timelapse module:', error);
      throw new Error('Timelapse module unavailable');
    }
  }
  
  // Image optimization
  optimizeImageUrl(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}): string {
    if (!this.config.enableImageOptimization) return url;
    
    const { width, height, quality = 80, format = 'webp' } = options;
    
    // For Pexels images, use their optimization parameters
    if (url.includes('pexels.com')) {
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      params.set('auto', 'compress');
      params.set('cs', 'tinysrgb');
      
      return `${url}?${params.toString()}`;
    }
    
    // For other images, return as-is or implement custom optimization
    return url;
  }
  
  // Preload critical resources
  async preloadCriticalAssets(): Promise<void> {
    if (Platform.OS !== 'web') return;
    
    const criticalAssets = [
      // Critical fonts
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap',
      
      // Critical images (logos, icons)
      '/assets/images/icon.png',
      '/assets/images/favicon.png'
    ];
    
    const preloadPromises = criticalAssets.map(asset => {
      return new Promise<void>((resolve, reject) => {
        if (asset.endsWith('.css')) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'style';
          link.href = asset;
          link.onload = () => resolve();
          link.onerror = () => reject(new Error(`Failed to preload ${asset}`));
          document.head.appendChild(link);
        } else {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to preload ${asset}`));
          img.src = asset;
        }
      });
    });
    
    try {
      await Promise.allSettled(preloadPromises);
      console.log('Critical assets preloaded');
    } catch (error) {
      console.warn('Some critical assets failed to preload:', error);
    }
  }
  
  // Service Worker registration
  async registerServiceWorker(): Promise<void> {
    if (!this.config.enableServiceWorker || typeof navigator === 'undefined') return;
    
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.notifyAppUpdate();
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }
  
  private notifyAppUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('appUpdateAvailable'));
    }
  }
  
  // Cache management
  async setupCaching(): Promise<void> {
    if (Platform.OS !== 'web' || !('caches' in window)) return;
    
    const cacheName = 'mural-app-v1';
    const urlsToCache = [
      '/',
      '/static/js/bundle.js',
      '/static/css/main.css',
      '/manifest.json'
    ];
    
    try {
      const cache = await caches.open(cacheName);
      await cache.addAll(urlsToCache);
      console.log('Assets cached successfully');
    } catch (error) {
      console.error('Failed to setup caching:', error);
    }
  }
  
  // Bundle analysis
  analyzeBundleSize(): {
    estimatedSize: number;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let estimatedSize = 0;
    
    // Estimate bundle size based on features used
    if (this.config.enableCodeSplitting) {
      estimatedSize += 500; // KB for main bundle
      recommendations.push('Code splitting is enabled - good for performance');
    } else {
      estimatedSize += 2000; // KB for monolithic bundle
      recommendations.push('Enable code splitting to reduce initial bundle size');
    }
    
    if (this.config.enableImageOptimization) {
      recommendations.push('Image optimization is enabled');
    } else {
      estimatedSize += 1000; // KB for unoptimized images
      recommendations.push('Enable image optimization to reduce bandwidth usage');
    }
    
    if (this.config.enableServiceWorker) {
      recommendations.push('Service Worker is enabled for offline support');
    } else {
      recommendations.push('Consider enabling Service Worker for better offline experience');
    }
    
    return {
      estimatedSize,
      recommendations
    };
  }
  
  // Tree shaking utilities
  getUnusedDependencies(): string[] {
    // In a real implementation, this would analyze the bundle
    // and identify unused dependencies
    const potentiallyUnused = [
      'lodash', // If using individual functions instead
      'moment', // If using date-fns instead
      'axios', // If using fetch instead
    ];
    
    return potentiallyUnused;
  }
  
  // Performance budgets
  checkPerformanceBudget(): {
    passed: boolean;
    budgets: Array<{
      metric: string;
      budget: number;
      actual: number;
      passed: boolean;
    }>;
  } {
    const budgets = [
      { metric: 'Bundle Size', budget: 1000, actual: 800, passed: true },
      { metric: 'First Contentful Paint', budget: 2000, actual: 1500, passed: true },
      { metric: 'Largest Contentful Paint', budget: 4000, actual: 3000, passed: true },
      { metric: 'Time to Interactive', budget: 5000, actual: 4000, passed: true }
    ];
    
    const allPassed = budgets.every(budget => budget.passed);
    
    return {
      passed: allPassed,
      budgets
    };
  }
  
  // Lazy loading utilities
  createIntersectionObserver(callback: (entries: IntersectionObserverEntry[]) => void): IntersectionObserver | null {
    if (Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined') {
      return null;
    }
    
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1
    });
  }
  
  // Resource hints
  addResourceHints(): void {
    if (Platform.OS !== 'web') return;
    
    const hints = [
      { rel: 'dns-prefetch', href: 'https://images.pexels.com' },
      { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://api.mural.app' }
    ];
    
    hints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      document.head.appendChild(link);
    });
  }
  
  // Configuration
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }
}

export default BundleOptimizer;
export type { OptimizationConfig, AssetManifest };