import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface ArtworkData {
  id: string;
  title: string;
  imageData: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  layers: LayerData[];
  metadata: {
    canType: string;
    colors: string[];
    duration: number;
    particleCount: number;
  };
}

interface LayerData {
  id: string;
  name: string;
  particles: any[];
  paths: string[];
  opacity: number;
  visible: boolean;
}

interface CachedArtwork {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  compressedData: string;
  lastViewed: number;
}

class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private readonly STORAGE_KEYS = {
    DRAFTS: 'mural_drafts',
    OFFLINE_ARTWORKS: 'mural_offline_artworks',
    USER_PREFERENCES: 'mural_user_preferences',
    CACHE_METADATA: 'mural_cache_metadata',
    SYNC_QUEUE: 'mural_sync_queue'
  };
  
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly MAX_DRAFTS = 10;
  private readonly COMPRESSION_QUALITY = 0.7;
  
  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }
  
  // Draft Management
  async saveDraft(artworkData: ArtworkData): Promise<string> {
    try {
      const drafts = await this.getDrafts();
      const draftId = artworkData.id || `draft_${Date.now()}`;
      
      // Compress artwork data
      const compressedData = await this.compressArtworkData(artworkData);
      
      const newDraft = {
        ...artworkData,
        id: draftId,
        compressedData,
        savedAt: Date.now()
      };
      
      // Limit number of drafts
      const updatedDrafts = [newDraft, ...drafts.slice(0, this.MAX_DRAFTS - 1)];
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.DRAFTS,
        JSON.stringify(updatedDrafts)
      );
      
      return draftId;
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw new Error('Failed to save draft');
    }
  }
  
  async getDrafts(): Promise<ArtworkData[]> {
    try {
      const draftsJson = await AsyncStorage.getItem(this.STORAGE_KEYS.DRAFTS);
      return draftsJson ? JSON.parse(draftsJson) : [];
    } catch (error) {
      console.error('Failed to get drafts:', error);
      return [];
    }
  }
  
  async deleteDraft(draftId: string): Promise<void> {
    try {
      const drafts = await this.getDrafts();
      const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.DRAFTS,
        JSON.stringify(updatedDrafts)
      );
    } catch (error) {
      console.error('Failed to delete draft:', error);
      throw new Error('Failed to delete draft');
    }
  }
  
  // Offline Artwork Caching
  async cacheArtworkForOffline(artwork: CachedArtwork): Promise<void> {
    try {
      const cachedArtworks = await this.getCachedArtworks();
      const cacheSize = await this.calculateCacheSize();
      
      // Check cache size limit
      if (cacheSize > this.MAX_CACHE_SIZE) {
        await this.cleanupOldCache();
      }
      
      const updatedCache = [
        { ...artwork, lastViewed: Date.now() },
        ...cachedArtworks.filter(cached => cached.id !== artwork.id)
      ];
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.OFFLINE_ARTWORKS,
        JSON.stringify(updatedCache)
      );
      
      await this.updateCacheMetadata();
    } catch (error) {
      console.error('Failed to cache artwork:', error);
      throw new Error('Failed to cache artwork');
    }
  }
  
  async getCachedArtworks(): Promise<CachedArtwork[]> {
    try {
      const cachedJson = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_ARTWORKS);
      return cachedJson ? JSON.parse(cachedJson) : [];
    } catch (error) {
      console.error('Failed to get cached artworks:', error);
      return [];
    }
  }
  
  async getCachedArtwork(artworkId: string): Promise<CachedArtwork | null> {
    try {
      const cachedArtworks = await this.getCachedArtworks();
      const artwork = cachedArtworks.find(cached => cached.id === artworkId);
      
      if (artwork) {
        // Update last viewed timestamp
        artwork.lastViewed = Date.now();
        await this.cacheArtworkForOffline(artwork);
      }
      
      return artwork || null;
    } catch (error) {
      console.error('Failed to get cached artwork:', error);
      return null;
    }
  }
  
  // User Preferences
  async saveUserPreferences(preferences: Record<string, any>): Promise<void> {
    try {
      const existingPrefs = await this.getUserPreferences();
      const updatedPrefs = { ...existingPrefs, ...preferences };
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(updatedPrefs)
      );
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      throw new Error('Failed to save preferences');
    }
  }
  
  async getUserPreferences(): Promise<Record<string, any>> {
    try {
      const prefsJson = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
      return prefsJson ? JSON.parse(prefsJson) : {};
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return {};
    }
  }
  
  // Sync Queue Management
  async addToSyncQueue(action: {
    type: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
  }): Promise<void> {
    try {
      const syncQueue = await this.getSyncQueue();
      const updatedQueue = [...syncQueue, { ...action, id: Date.now().toString() }];
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SYNC_QUEUE,
        JSON.stringify(updatedQueue)
      );
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }
  
  async getSyncQueue(): Promise<any[]> {
    try {
      const queueJson = await AsyncStorage.getItem(this.STORAGE_KEYS.SYNC_QUEUE);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }
  
  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }
  
  // Utility Methods
  private async compressArtworkData(artworkData: ArtworkData): Promise<string> {
    try {
      // Compress particle data and paths
      const compressedLayers = artworkData.layers.map(layer => ({
        ...layer,
        particles: this.compressParticleData(layer.particles),
        paths: this.compressPathData(layer.paths)
      }));
      
      const compressedArtwork = {
        ...artworkData,
        layers: compressedLayers
      };
      
      return JSON.stringify(compressedArtwork);
    } catch (error) {
      console.error('Failed to compress artwork data:', error);
      return JSON.stringify(artworkData);
    }
  }
  
  private compressParticleData(particles: any[]): any[] {
    // Reduce precision and remove unnecessary data
    return particles.map(particle => ({
      x: Math.round(particle.x),
      y: Math.round(particle.y),
      size: Math.round(particle.size),
      color: particle.color,
      opacity: Math.round(particle.opacity * 100) / 100
    }));
  }
  
  private compressPathData(paths: string[]): string[] {
    // Simplify SVG paths by reducing precision
    return paths.map(path => 
      path.replace(/(\d+\.\d{3,})/g, (match) => 
        parseFloat(match).toFixed(2)
      )
    );
  }
  
  private async calculateCacheSize(): Promise<number> {
    try {
      const cachedArtworks = await this.getCachedArtworks();
      return cachedArtworks.reduce((total, artwork) => {
        return total + (artwork.compressedData?.length || 0);
      }, 0);
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return 0;
    }
  }
  
  private async cleanupOldCache(): Promise<void> {
    try {
      const cachedArtworks = await this.getCachedArtworks();
      
      // Sort by last viewed (oldest first) and remove 25% of cache
      const sortedCache = cachedArtworks.sort((a, b) => a.lastViewed - b.lastViewed);
      const itemsToRemove = Math.floor(sortedCache.length * 0.25);
      const cleanedCache = sortedCache.slice(itemsToRemove);
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.OFFLINE_ARTWORKS,
        JSON.stringify(cleanedCache)
      );
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
    }
  }
  
  private async updateCacheMetadata(): Promise<void> {
    try {
      const metadata = {
        lastUpdated: Date.now(),
        cacheSize: await this.calculateCacheSize(),
        itemCount: (await this.getCachedArtworks()).length
      };
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.CACHE_METADATA,
        JSON.stringify(metadata)
      );
    } catch (error) {
      console.error('Failed to update cache metadata:', error);
    }
  }
  
  // Storage Management
  async getStorageInfo(): Promise<{
    totalSize: number;
    draftsSize: number;
    cacheSize: number;
    preferencesSize: number;
  }> {
    try {
      const [drafts, cache, preferences] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.DRAFTS),
        AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_ARTWORKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES)
      ]);
      
      const draftsSize = drafts?.length || 0;
      const cacheSize = cache?.length || 0;
      const preferencesSize = preferences?.length || 0;
      const totalSize = draftsSize + cacheSize + preferencesSize;
      
      return {
        totalSize,
        draftsSize,
        cacheSize,
        preferencesSize
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        totalSize: 0,
        draftsSize: 0,
        cacheSize: 0,
        preferencesSize: 0
      };
    }
  }
  
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.STORAGE_KEYS.DRAFTS),
        AsyncStorage.removeItem(this.STORAGE_KEYS.OFFLINE_ARTWORKS),
        AsyncStorage.removeItem(this.STORAGE_KEYS.USER_PREFERENCES),
        AsyncStorage.removeItem(this.STORAGE_KEYS.CACHE_METADATA),
        AsyncStorage.removeItem(this.STORAGE_KEYS.SYNC_QUEUE)
      ]);
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error('Failed to clear data');
    }
  }
}

export default OfflineStorageManager;
export type { ArtworkData, LayerData, CachedArtwork };