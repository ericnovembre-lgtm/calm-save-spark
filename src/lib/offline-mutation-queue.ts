/**
 * Offline Mutation Queue
 * IndexedDB-backed queue for storing mutations when offline
 * Integrates with Background Sync API for automatic retry
 */

const DB_NAME = 'saveplus-offline';
const DB_VERSION = 1;
const STORE_NAME = 'mutation-queue';

export interface QueuedMutation {
  id: string;
  type: 'goal' | 'transaction' | 'budget' | 'pot' | 'debt' | 'automation';
  action: 'create' | 'update' | 'delete';
  endpoint: string;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  userId: string;
  signature: string; // For deduplication
}

export interface QueueStatus {
  pendingCount: number;
  oldestMutation: QueuedMutation | null;
  isSyncing: boolean;
  lastSyncAttempt: number | null;
  lastSyncSuccess: number | null;
}

// Global state
let db: IDBDatabase | null = null;
let syncingState = false;
let lastSyncAttempt: number | null = null;
let lastSyncSuccess: number | null = null;

/**
 * Initialize IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
  if (db) return db;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('signature', 'signature', { unique: true });
        store.createIndex('userId', 'userId', { unique: false });
      }
    };
  });
}

/**
 * Generate unique mutation ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate signature for deduplication
 */
function generateSignature(
  type: QueuedMutation['type'],
  action: QueuedMutation['action'],
  payload: Record<string, unknown>
): string {
  const str = JSON.stringify({ type, action, payload });
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Add mutation to queue
 */
export async function queueMutation(
  type: QueuedMutation['type'],
  action: QueuedMutation['action'],
  endpoint: string,
  payload: Record<string, unknown>,
  userId: string
): Promise<QueuedMutation> {
  const database = await initDB();
  const signature = generateSignature(type, action, payload);
  
  const mutation: QueuedMutation = {
    id: generateId(),
    type,
    action,
    endpoint,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
    maxRetries: 5,
    userId,
    signature,
  };
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Check for duplicate by signature
    const signatureIndex = store.index('signature');
    const getRequest = signatureIndex.get(signature);
    
    getRequest.onsuccess = () => {
      if (getRequest.result) {
        // Duplicate exists, return existing
        resolve(getRequest.result);
        return;
      }
      
      // Add new mutation
      const addRequest = store.add(mutation);
      addRequest.onsuccess = () => resolve(mutation);
      addRequest.onerror = () => reject(addRequest.error);
    };
    
    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Get all pending mutations
 */
export async function getPendingMutations(): Promise<QueuedMutation[]> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get mutations by type
 */
export async function getMutationsByType(type: QueuedMutation['type']): Promise<QueuedMutation[]> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('type');
    const request = index.getAll(type);
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove mutation from queue
 */
export async function removeMutation(id: string): Promise<void> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update mutation retry count
 */
export async function incrementRetryCount(id: string): Promise<boolean> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const mutation = getRequest.result as QueuedMutation;
      if (!mutation) {
        resolve(false);
        return;
      }
      
      mutation.retryCount++;
      
      // Check if max retries exceeded
      if (mutation.retryCount >= mutation.maxRetries) {
        // Remove failed mutation
        store.delete(id);
        resolve(false);
        return;
      }
      
      const putRequest = store.put(mutation);
      putRequest.onsuccess = () => resolve(true);
      putRequest.onerror = () => reject(putRequest.error);
    };
    
    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Clear all mutations for a user
 */
export async function clearUserMutations(userId: string): Promise<number> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('userId');
    const request = index.openCursor(IDBKeyRange.only(userId));
    
    let deleted = 0;
    
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        deleted++;
        cursor.continue();
      } else {
        resolve(deleted);
      }
    };
    
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get queue status
 */
export async function getQueueStatus(): Promise<QueueStatus> {
  const mutations = await getPendingMutations();
  
  return {
    pendingCount: mutations.length,
    oldestMutation: mutations.length > 0 ? mutations[0] : null,
    isSyncing: syncingState,
    lastSyncAttempt,
    lastSyncSuccess,
  };
}

/**
 * Set syncing state (called by service worker)
 */
export function setSyncingState(syncing: boolean, success?: boolean): void {
  syncingState = syncing;
  lastSyncAttempt = Date.now();
  if (success) {
    lastSyncSuccess = Date.now();
  }
}

/**
 * Register background sync (if supported)
 */
export async function registerBackgroundSync(tag: string = 'mutation-sync'): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
    console.warn('Background Sync not supported');
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    // @ts-ignore - sync API may not be in types
    await registration.sync.register(tag);
    console.log('Background sync registered:', tag);
    return true;
  } catch (err) {
    console.error('Failed to register background sync:', err);
    return false;
  }
}

/**
 * Listen for sync completion messages from service worker
 */
export function onSyncComplete(callback: (success: boolean, syncedCount: number) => void): () => void {
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'SYNC_COMPLETE') {
      callback(event.data.success, event.data.syncedCount);
    }
  };
  
  navigator.serviceWorker?.addEventListener('message', handler);
  
  return () => {
    navigator.serviceWorker?.removeEventListener('message', handler);
  };
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Wait for online status
 */
export function waitForOnline(): Promise<void> {
  if (navigator.onLine) return Promise.resolve();
  
  return new Promise((resolve) => {
    const handler = () => {
      window.removeEventListener('online', handler);
      resolve();
    };
    window.addEventListener('online', handler);
  });
}
