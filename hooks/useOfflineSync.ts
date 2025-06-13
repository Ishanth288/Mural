import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import OfflineStorageManager from '@/utils/OfflineStorage';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingActions: number;
  syncProgress: number;
  error: string | null;
}

interface SyncAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    pendingActions: 0,
    syncProgress: 0,
    error: null
  });
  
  const storageManager = OfflineStorageManager.getInstance();
  
  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !syncStatus.isOnline;
      const isNowOnline = state.isConnected && state.isInternetReachable;
      
      setSyncStatus(prev => ({
        ...prev,
        isOnline: isNowOnline || false,
        error: isNowOnline ? null : 'No internet connection'
      }));
      
      // Auto-sync when coming back online
      if (wasOffline && isNowOnline) {
        syncPendingActions();
      }
    });
    
    return unsubscribe;
  }, [syncStatus.isOnline]);
  
  // Load pending actions count on mount
  useEffect(() => {
    loadPendingActionsCount();
  }, []);
  
  const loadPendingActionsCount = async () => {
    try {
      const syncQueue = await storageManager.getSyncQueue();
      setSyncStatus(prev => ({
        ...prev,
        pendingActions: syncQueue.length
      }));
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  };
  
  const addToSyncQueue = useCallback(async (action: Omit<SyncAction, 'id' | 'retryCount'>) => {
    try {
      await storageManager.addToSyncQueue({
        ...action,
        timestamp: Date.now()
      });
      
      setSyncStatus(prev => ({
        ...prev,
        pendingActions: prev.pendingActions + 1
      }));
      
      // Try to sync immediately if online
      if (syncStatus.isOnline) {
        syncPendingActions();
      }
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      setSyncStatus(prev => ({
        ...prev,
        error: 'Failed to queue action for sync'
      }));
    }
  }, [syncStatus.isOnline]);
  
  const syncPendingActions = useCallback(async () => {
    if (!syncStatus.isOnline || syncStatus.isSyncing) {
      return;
    }
    
    setSyncStatus(prev => ({
      ...prev,
      isSyncing: true,
      error: null,
      syncProgress: 0
    }));
    
    try {
      const syncQueue = await storageManager.getSyncQueue();
      
      if (syncQueue.length === 0) {
        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: Date.now()
        }));
        return;
      }
      
      const totalActions = syncQueue.length;
      let completedActions = 0;
      const failedActions: SyncAction[] = [];
      
      for (const action of syncQueue) {
        try {
          await syncAction(action);
          completedActions++;
          
          setSyncStatus(prev => ({
            ...prev,
            syncProgress: (completedActions / totalActions) * 100
          }));
        } catch (error) {
          console.error('Failed to sync action:', error);
          failedActions.push({
            ...action,
            retryCount: (action.retryCount || 0) + 1
          });
        }
      }
      
      // Clear successfully synced actions
      await storageManager.clearSyncQueue();
      
      // Re-queue failed actions (with retry limit)
      for (const failedAction of failedActions) {
        if (failedAction.retryCount < 3) {
          await storageManager.addToSyncQueue(failedAction);
        }
      }
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
        pendingActions: failedActions.filter(a => a.retryCount < 3).length,
        syncProgress: 100,
        error: failedActions.length > 0 ? `${failedActions.length} actions failed to sync` : null
      }));
      
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Sync failed. Will retry when connection improves.'
      }));
    }
  }, [syncStatus.isOnline, syncStatus.isSyncing]);
  
  const syncAction = async (action: SyncAction) => {
    // Simulate API calls - replace with actual API implementation
    switch (action.type) {
      case 'create':
        await simulateApiCall('POST', '/artworks', action.data);
        break;
      case 'update':
        await simulateApiCall('PUT', `/artworks/${action.data.id}`, action.data);
        break;
      case 'delete':
        await simulateApiCall('DELETE', `/artworks/${action.data.id}`);
        break;
    }
  };
  
  const simulateApiCall = async (method: string, endpoint: string, data?: any) => {
    // Simulate network delay and potential failures
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate 10% failure rate
    if (Math.random() < 0.1) {
      throw new Error(`API call failed: ${method} ${endpoint}`);
    }
  };
  
  const forcSync = useCallback(() => {
    if (syncStatus.isOnline) {
      syncPendingActions();
    }
  }, [syncPendingActions, syncStatus.isOnline]);
  
  const clearSyncQueue = useCallback(async () => {
    try {
      await storageManager.clearSyncQueue();
      setSyncStatus(prev => ({
        ...prev,
        pendingActions: 0,
        error: null
      }));
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }, []);
  
  return {
    syncStatus,
    addToSyncQueue,
    syncPendingActions: forcSync,
    clearSyncQueue
  };
}

// Hook for managing offline artwork viewing
export function useOfflineArtworks() {
  const [cachedArtworks, setCachedArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const storageManager = OfflineStorageManager.getInstance();
  
  useEffect(() => {
    loadCachedArtworks();
  }, []);
  
  const loadCachedArtworks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const cached = await storageManager.getCachedArtworks();
      setCachedArtworks(cached);
    } catch (err) {
      setError('Failed to load cached artworks');
      console.error('Failed to load cached artworks:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const cacheArtwork = async (artwork: any) => {
    try {
      await storageManager.cacheArtworkForOffline(artwork);
      await loadCachedArtworks();
    } catch (err) {
      setError('Failed to cache artwork');
      console.error('Failed to cache artwork:', err);
    }
  };
  
  const getCachedArtwork = async (artworkId: string) => {
    try {
      return await storageManager.getCachedArtwork(artworkId);
    } catch (err) {
      console.error('Failed to get cached artwork:', err);
      return null;
    }
  };
  
  return {
    cachedArtworks,
    isLoading,
    error,
    cacheArtwork,
    getCachedArtwork,
    refreshCache: loadCachedArtworks
  };
}