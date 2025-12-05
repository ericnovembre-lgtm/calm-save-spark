/**
 * Mock Factories for Offline Sync Testing
 */

import { vi } from 'vitest';
import { QueuedMutation, QueueStatus } from '@/lib/offline-mutation-queue';

// Mock mutation factory
export function createMockQueuedMutation(
  overrides: Partial<QueuedMutation> = {}
): QueuedMutation {
  return {
    id: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type: 'goal',
    action: 'create',
    endpoint: '/api/goals',
    payload: { name: 'Test Goal', amount: 1000 },
    timestamp: Date.now(),
    retryCount: 0,
    maxRetries: 5,
    userId: 'test-user-id',
    signature: 'mock-signature',
    ...overrides,
  };
}

// Mock queue status factory
export function createMockQueueStatus(
  overrides: Partial<QueueStatus> = {}
): QueueStatus {
  return {
    pendingCount: 0,
    oldestMutation: null,
    isSyncing: false,
    lastSyncAttempt: null,
    lastSyncSuccess: null,
    ...overrides,
  };
}

// Mock IndexedDB implementation
export class MockIndexedDB {
  private stores: Map<string, Map<string, unknown>> = new Map();
  private databases: Map<string, { version: number; objectStoreNames: string[] }> = new Map();

  open(name: string, version?: number): IDBOpenDBRequest {
    const request = this.createRequest();
    
    setTimeout(() => {
      if (!this.databases.has(name)) {
        this.databases.set(name, { version: version || 1, objectStoreNames: [] });
        const upgradeEvent = new Event('upgradeneeded') as IDBVersionChangeEvent;
        Object.defineProperty(upgradeEvent, 'target', { value: request });
        request.onupgradeneeded?.(upgradeEvent);
      }
      
      const db = this.createMockDatabase(name);
      Object.defineProperty(request, 'result', { value: db, writable: true });
      request.onsuccess?.(new Event('success'));
    }, 0);
    
    return request;
  }

  private createRequest(): IDBOpenDBRequest {
    return {
      result: null,
      error: null,
      source: null,
      transaction: null,
      readyState: 'pending',
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      onblocked: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as IDBOpenDBRequest;
  }

  private createMockDatabase(name: string): IDBDatabase {
    const dbInfo = this.databases.get(name)!;
    
    return {
      name,
      version: dbInfo.version,
      objectStoreNames: dbInfo.objectStoreNames as unknown as DOMStringList,
      createObjectStore: (storeName: string, options?: IDBObjectStoreParameters) => {
        this.stores.set(storeName, new Map());
        dbInfo.objectStoreNames.push(storeName);
        return this.createMockObjectStore(storeName);
      },
      transaction: (storeNames: string | string[], mode?: IDBTransactionMode) => {
        return this.createMockTransaction(storeNames, mode);
      },
      close: vi.fn(),
      deleteObjectStore: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onabort: null,
      onclose: null,
      onerror: null,
      onversionchange: null,
    } as unknown as IDBDatabase;
  }

  private createMockObjectStore(storeName: string): IDBObjectStore {
    const store = this.stores.get(storeName) || new Map();
    this.stores.set(storeName, store);

    return {
      name: storeName,
      keyPath: 'id',
      indexNames: [] as unknown as DOMStringList,
      autoIncrement: false,
      createIndex: (name: string) => this.createMockIndex(storeName, name),
      index: (name: string) => this.createMockIndex(storeName, name),
      add: (value: unknown) => this.createDataRequest(() => {
        const id = (value as { id: string }).id;
        store.set(id, value);
        return id;
      }),
      put: (value: unknown) => this.createDataRequest(() => {
        const id = (value as { id: string }).id;
        store.set(id, value);
        return id;
      }),
      get: (key: IDBValidKey) => this.createDataRequest(() => store.get(key as string)),
      getAll: () => this.createDataRequest(() => Array.from(store.values())),
      delete: (key: IDBValidKey) => this.createDataRequest(() => store.delete(key as string)),
      clear: () => this.createDataRequest(() => store.clear()),
      count: () => this.createDataRequest(() => store.size),
      openCursor: () => this.createCursorRequest(store),
      openKeyCursor: () => this.createCursorRequest(store),
      transaction: null as unknown as IDBTransaction,
      deleteIndex: vi.fn(),
      getAllKeys: () => this.createDataRequest(() => Array.from(store.keys())),
      getKey: () => this.createDataRequest(() => undefined),
    } as unknown as IDBObjectStore;
  }

  private createMockIndex(storeName: string, indexName: string): IDBIndex {
    const store = this.stores.get(storeName) || new Map();
    
    return {
      name: indexName,
      keyPath: indexName,
      multiEntry: false,
      unique: indexName === 'signature',
      objectStore: this.createMockObjectStore(storeName),
      get: (key: IDBValidKey) => this.createDataRequest(() => {
        for (const value of store.values()) {
          if ((value as Record<string, unknown>)[indexName] === key) {
            return value;
          }
        }
        return undefined;
      }),
      getAll: (key?: IDBValidKey) => this.createDataRequest(() => {
        if (!key) return Array.from(store.values());
        return Array.from(store.values()).filter(
          (v) => (v as Record<string, unknown>)[indexName] === key
        );
      }),
      getAllKeys: () => this.createDataRequest(() => Array.from(store.keys())),
      getKey: () => this.createDataRequest(() => undefined),
      count: () => this.createDataRequest(() => store.size),
      openCursor: (range?: IDBValidKey | IDBKeyRange) => this.createCursorRequest(store, indexName, range),
      openKeyCursor: () => this.createCursorRequest(store),
    } as unknown as IDBIndex;
  }

  private createMockTransaction(storeNames: string | string[], mode?: IDBTransactionMode): IDBTransaction {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames];
    
    return {
      db: null as unknown as IDBDatabase,
      durability: 'default',
      error: null,
      mode: mode || 'readonly',
      objectStoreNames: names as unknown as DOMStringList,
      objectStore: (name: string) => this.createMockObjectStore(name),
      abort: vi.fn(),
      commit: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onabort: null,
      oncomplete: null,
      onerror: null,
    } as unknown as IDBTransaction;
  }

  private createDataRequest<T>(getData: () => T): IDBRequest<T> {
    const request = {
      result: undefined as T | undefined,
      error: null,
      source: null,
      transaction: null,
      readyState: 'pending',
      onsuccess: null as ((ev: Event) => void) | null,
      onerror: null as ((ev: Event) => void) | null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    setTimeout(() => {
      try {
        (request as { result: T }).result = getData();
        request.onsuccess?.(new Event('success'));
      } catch (err) {
        (request as { error: DOMException }).error = err as DOMException;
        request.onerror?.(new Event('error'));
      }
    }, 0);

    return request as unknown as IDBRequest<T>;
  }

  private createCursorRequest(
    store: Map<string, unknown>,
    indexName?: string,
    range?: IDBValidKey | IDBKeyRange
  ): IDBRequest<IDBCursorWithValue | null> {
    const entries = Array.from(store.entries());
    let currentIndex = 0;

    // Filter by range if provided
    const filteredEntries = range && indexName
      ? entries.filter(([, v]) => (v as Record<string, unknown>)[indexName] === range)
      : entries;

    const request = {
      result: null as IDBCursorWithValue | null,
      error: null,
      source: null,
      transaction: null,
      readyState: 'pending',
      onsuccess: null as ((ev: Event) => void) | null,
      onerror: null as ((ev: Event) => void) | null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    const createCursor = (): IDBCursorWithValue | null => {
      if (currentIndex >= filteredEntries.length) return null;
      
      const [key, value] = filteredEntries[currentIndex];
      
      return {
        key,
        primaryKey: key,
        value,
        direction: 'next',
        source: null as unknown as IDBObjectStore,
        request: request as unknown as IDBRequest,
        advance: vi.fn(),
        continue: () => {
          currentIndex++;
          setTimeout(() => {
            (request as { result: IDBCursorWithValue | null }).result = createCursor();
            request.onsuccess?.(new Event('success'));
          }, 0);
        },
        continuePrimaryKey: vi.fn(),
        delete: () => {
          store.delete(key);
          return this.createDataRequest(() => undefined);
        },
        update: vi.fn(),
      } as unknown as IDBCursorWithValue;
    };

    setTimeout(() => {
      (request as { result: IDBCursorWithValue | null }).result = createCursor();
      request.onsuccess?.(new Event('success'));
    }, 0);

    return request as unknown as IDBRequest<IDBCursorWithValue | null>;
  }

  // Helper to clear all data
  clear() {
    this.stores.clear();
    this.databases.clear();
  }

  // Helper to get store data for assertions
  getStoreData(storeName: string): Map<string, unknown> | undefined {
    return this.stores.get(storeName);
  }
}

// Mock Service Worker
export function createMockServiceWorker() {
  const messageListeners: ((event: MessageEvent) => void)[] = [];
  
  return {
    ready: Promise.resolve({
      active: {
        postMessage: vi.fn((message) => {
          // Simulate response for certain message types
          if (message.type === 'MANUAL_SYNC') {
            setTimeout(() => {
              const event = new MessageEvent('message', {
                data: { type: 'SYNC_COMPLETE', success: true, syncedCount: 1 },
              });
              messageListeners.forEach((listener) => listener(event));
            }, 100);
          }
        }),
      },
      sync: {
        register: vi.fn().mockResolvedValue(undefined),
      },
    }),
    addEventListener: vi.fn((type, handler) => {
      if (type === 'message') {
        messageListeners.push(handler);
      }
    }),
    removeEventListener: vi.fn((type, handler) => {
      if (type === 'message') {
        const index = messageListeners.indexOf(handler);
        if (index > -1) messageListeners.splice(index, 1);
      }
    }),
    controller: null,
    oncontrollerchange: null,
    onmessage: null,
    onmessageerror: null,
    dispatchEvent: vi.fn(),
    getRegistration: vi.fn(),
    getRegistrations: vi.fn(),
    register: vi.fn(),
    startMessages: vi.fn(),
  };
}

// Mock navigator.onLine
export function mockNavigatorOnline(online: boolean = true) {
  Object.defineProperty(navigator, 'onLine', {
    value: online,
    writable: true,
    configurable: true,
  });
}

// Simulate going online/offline
export function simulateOnline() {
  mockNavigatorOnline(true);
  window.dispatchEvent(new Event('online'));
}

export function simulateOffline() {
  mockNavigatorOnline(false);
  window.dispatchEvent(new Event('offline'));
}

// Mock Supabase realtime for sync
export function mockSupabaseRealtimeSync(callback: (success: boolean) => void) {
  return vi.fn().mockImplementation(() => {
    setTimeout(() => callback(true), 100);
    return { unsubscribe: vi.fn() };
  });
}
