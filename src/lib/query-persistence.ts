/**
 * Query Persistence - IndexedDB layer for React Query cache
 * Enables instant app load with persisted data
 */
import { QueryClient } from '@tanstack/react-query';

const DB_NAME = 'save_plus_query_cache';
const DB_VERSION = 1;
const STORE_NAME = 'queries';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedQuery {
  key: string;
  data: any;
  timestamp: number;
  staleTime?: number;
}

/**
 * Open IndexedDB connection
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

/**
 * Serialize query key to string
 */
const serializeKey = (key: any[]): string => {
  return JSON.stringify(key);
};

/**
 * Save query to IndexedDB
 */
export const persistQuery = async (
  key: any[],
  data: any,
  staleTime?: number
): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const cached: CachedQuery = {
      key: serializeKey(key),
      data,
      timestamp: Date.now(),
      staleTime,
    };

    store.put(cached);
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('[Query Persistence] Failed to persist:', error);
  }
};

/**
 * Load query from IndexedDB
 */
export const loadQuery = async (key: any[]): Promise<any | null> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(serializeKey(key));
      
      request.onsuccess = () => {
        const cached = request.result as CachedQuery | undefined;
        
        if (!cached) {
          resolve(null);
          return;
        }

        // Check if data is too old
        const age = Date.now() - cached.timestamp;
        if (age > MAX_AGE_MS) {
          // Delete stale data
          const deleteTx = db.transaction(STORE_NAME, 'readwrite');
          deleteTx.objectStore(STORE_NAME).delete(cached.key);
          resolve(null);
          return;
        }

        resolve(cached.data);
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('[Query Persistence] Failed to load:', error);
    return null;
  }
};

/**
 * Delete query from IndexedDB
 */
export const deleteQuery = async (key: any[]): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(serializeKey(key));
  } catch (error) {
    console.warn('[Query Persistence] Failed to delete:', error);
  }
};

/**
 * Clear all cached queries
 */
export const clearQueryCache = async (): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  } catch (error) {
    console.warn('[Query Persistence] Failed to clear:', error);
  }
};

/**
 * Clean up expired queries
 */
export const cleanupExpiredQueries = async (): Promise<number> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          const cached = cursor.value as CachedQuery;
          const age = Date.now() - cached.timestamp;
          
          if (age > MAX_AGE_MS) {
            cursor.delete();
            deletedCount++;
          }
          
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('[Query Persistence] Cleanup failed:', error);
    return 0;
  }
};

/**
 * Keys to persist (critical user data)
 */
const PERSIST_KEYS = [
  'dashboard-layout',
  'user-preferences',
  'goals',
  'pots',
  'budgets',
  'financial-health',
];

/**
 * Check if key should be persisted
 */
const shouldPersist = (key: any[]): boolean => {
  const keyString = serializeKey(key);
  return PERSIST_KEYS.some(pk => keyString.includes(pk));
};

/**
 * Setup persistence for QueryClient
 */
export const setupQueryPersistence = (queryClient: QueryClient): void => {
  // Subscribe to cache changes
  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'updated' && event.query.state.data) {
      const key = event.query.queryKey;
      
      if (shouldPersist(key)) {
        persistQuery(key, event.query.state.data);
      }
    }
  });

  // Hydrate cache on startup
  const hydrateCache = async () => {
    for (const keyPrefix of PERSIST_KEYS) {
      const data = await loadQuery([keyPrefix]);
      if (data) {
        queryClient.setQueryData([keyPrefix], data);
      }
    }
  };

  // Run hydration
  hydrateCache();

  // Cleanup expired data periodically
  setInterval(() => {
    cleanupExpiredQueries();
  }, 60 * 60 * 1000); // Every hour

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    unsubscribe();
  });
};

/**
 * Hook to manually persist a query
 */
export const usePersistQuery = () => {
  return {
    persist: persistQuery,
    load: loadQuery,
    delete: deleteQuery,
    clear: clearQueryCache,
  };
};
