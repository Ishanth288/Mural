import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SecurityConfig {
  maxFileSize: number;
  allowedImageTypes: string[];
  maxInputLength: number;
  rateLimitWindow: number;
  maxRequestsPerWindow: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class SecurityManager {
  private static instance: SecurityManager;
  private rateLimitMap = new Map<string, RateLimitEntry>();
  
  private readonly config: SecurityConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxInputLength: 1000,
    rateLimitWindow: 60000, // 1 minute
    maxRequestsPerWindow: 100
  };
  
  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }
  
  // Input Validation & Sanitization
  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .slice(0, this.config.maxInputLength);
  }
  
  validateColorHex(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }
  
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }
  
  validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  }
  
  // File Upload Security
  async validateImageFile(file: {
    uri: string;
    type?: string;
    size?: number;
  }): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Check file size
      if (file.size && file.size > this.config.maxFileSize) {
        return { isValid: false, error: 'File size exceeds limit' };
      }
      
      // Check file type
      if (file.type && !this.config.allowedImageTypes.includes(file.type)) {
        return { isValid: false, error: 'Invalid file type' };
      }
      
      // Additional validation for web platform
      if (Platform.OS === 'web' && file.uri.startsWith('data:')) {
        const mimeType = file.uri.split(';')[0].split(':')[1];
        if (!this.config.allowedImageTypes.includes(mimeType)) {
          return { isValid: false, error: 'Invalid image format' };
        }
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'File validation failed' };
    }
  }
  
  // Rate Limiting
  checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(identifier);
    
    if (!entry || now > entry.resetTime) {
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + this.config.rateLimitWindow
      });
      return true;
    }
    
    if (entry.count >= this.config.maxRequestsPerWindow) {
      return false;
    }
    
    entry.count++;
    return true;
  }
  
  // Token Management
  async storeSecureToken(key: string, token: string): Promise<void> {
    try {
      // In production, use secure storage like Keychain (iOS) or Keystore (Android)
      await AsyncStorage.setItem(`secure_${key}`, token);
    } catch (error) {
      console.error('Failed to store secure token:', error);
      throw new Error('Token storage failed');
    }
  }
  
  async getSecureToken(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`secure_${key}`);
    } catch (error) {
      console.error('Failed to retrieve secure token:', error);
      return null;
    }
  }
  
  async removeSecureToken(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`secure_${key}`);
    } catch (error) {
      console.error('Failed to remove secure token:', error);
    }
  }
  
  // Content Security Policy for Web
  getCSPHeaders(): Record<string, string> {
    if (Platform.OS !== 'web') return {};
    
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' wss: https:",
        "font-src 'self' data:",
        "media-src 'self' data:",
        "worker-src 'self' blob:"
      ].join('; ')
    };
  }
  
  // XSS Protection
  escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  // Secure Random Generation
  generateSecureId(): string {
    const array = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Fallback for environments without crypto
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Privacy Compliance
  async clearUserData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userDataKeys = keys.filter(key => 
        key.startsWith('user_') || 
        key.startsWith('secure_') ||
        key.startsWith('mural_')
      );
      
      await AsyncStorage.multiRemove(userDataKeys);
    } catch (error) {
      console.error('Failed to clear user data:', error);
      throw new Error('Data clearing failed');
    }
  }
  
  // Audit Logging
  async logSecurityEvent(event: {
    type: 'auth' | 'upload' | 'api' | 'error';
    action: string;
    userId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const logEntry = {
        ...event,
        timestamp: Date.now(),
        platform: Platform.OS,
        userAgent: Platform.OS === 'web' ? navigator.userAgent : undefined
      };
      
      // In production, send to secure logging service
      console.log('Security Event:', logEntry);
      
      // Store locally for offline scenarios
      const logs = await this.getSecurityLogs();
      logs.push(logEntry);
      
      // Keep only last 100 logs
      const recentLogs = logs.slice(-100);
      await AsyncStorage.setItem('security_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
  
  private async getSecurityLogs(): Promise<any[]> {
    try {
      const logs = await AsyncStorage.getItem('security_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      return [];
    }
  }
}

export default SecurityManager;