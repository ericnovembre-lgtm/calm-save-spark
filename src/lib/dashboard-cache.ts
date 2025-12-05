/**
 * IndexedDB cache for dashboard data - enables offline dashboard support
 */

const DB_NAME = 'saveplus-dashboard-cache';
const DB_VERSION = 1;
const STORE_NAME = 'dashboard-layouts';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface DashboardCacheEntry {
  userId: string;
  layout: any;
  widgets: Record<string, any>;
  theme: any;
  briefing: any;
  cachedAt: number;
}

class DashboardCacheManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn('IndexedDB not available for dashboard cache');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'userId' });
        }
      };
    });

    return this.initPromise;
  }

  async get(userId: string): Promise<DashboardCacheEntry | null> {
    try {
      await this.init();
      if (!this.db) return null;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(userId);

        request.onsuccess = () => {
          const entry = request.result as DashboardCacheEntry | undefined;
          if (!entry) {
            resolve(null);
            return;
          }

          // Check TTL
          const age = Date.now() - entry.cachedAt;
          if (age > CACHE_TTL_MS) {
            // Cache is stale but still usable for offline
            resolve({ ...entry, isStale: true } as any);
          } else {
            resolve(entry);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to read dashboard cache:', error);
      return null;
    }
  }

  async set(userId: string, data: Omit<DashboardCacheEntry, 'userId' | 'cachedAt'>): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      const entry: DashboardCacheEntry = {
        ...data,
        userId,
        cachedAt: Date.now(),
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(entry);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to write dashboard cache:', error);
    }
  }

  async clear(userId: string): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(userId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to clear dashboard cache:', error);
    }
  }

  async getCacheAge(userId: string): Promise<number | null> {
    const entry = await this.get(userId);
    if (!entry) return null;
    return Date.now() - entry.cachedAt;
  }
}

export const dashboardCache = new DashboardCacheManager();
