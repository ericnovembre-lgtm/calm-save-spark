import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IndexedDB for offline sync tests
const mockIndexedDBStore = new Map<string, unknown>();

const mockIndexedDB = {
  open: vi.fn(() => {
    const request = {
      result: {
        createObjectStore: vi.fn(() => ({
          createIndex: vi.fn(),
        })),
        transaction: vi.fn(() => ({
          objectStore: vi.fn(() => ({
            add: vi.fn(() => ({ onsuccess: null, onerror: null })),
            put: vi.fn(() => ({ onsuccess: null, onerror: null })),
            get: vi.fn(() => ({ onsuccess: null, onerror: null })),
            getAll: vi.fn(() => ({ onsuccess: null, onerror: null, result: [] })),
            delete: vi.fn(() => ({ onsuccess: null, onerror: null })),
            index: vi.fn(() => ({
              get: vi.fn(() => ({ onsuccess: null, onerror: null })),
              getAll: vi.fn(() => ({ onsuccess: null, onerror: null, result: [] })),
              openCursor: vi.fn(() => ({ onsuccess: null, onerror: null })),
            })),
          })),
        })),
        objectStoreNames: { contains: vi.fn(() => false) },
      },
      onsuccess: null as (() => void) | null,
      onerror: null as (() => void) | null,
      onupgradeneeded: null as (() => void) | null,
    };
    setTimeout(() => request.onsuccess?.(), 0);
    return request;
  }),
  deleteDatabase: vi.fn(),
};

// Mock Service Worker
const mockServiceWorkerRegistration = {
  active: {
    postMessage: vi.fn(),
  },
  sync: {
    register: vi.fn().mockResolvedValue(undefined),
  },
};

const mockServiceWorker = {
  ready: Promise.resolve(mockServiceWorkerRegistration),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
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

// Apply global mocks
beforeEach(() => {
  // Reset IndexedDB store
  mockIndexedDBStore.clear();
  
  // Apply indexedDB mock if not already applied by specific test
  if (!vi.isMockFunction(globalThis.indexedDB?.open)) {
    vi.stubGlobal('indexedDB', mockIndexedDB);
  }
});

// Mock navigator.serviceWorker if not present
if (typeof navigator !== 'undefined' && !navigator.serviceWorker) {
  Object.defineProperty(navigator, 'serviceWorker', {
    value: mockServiceWorker,
    writable: true,
    configurable: true,
  });
}

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
  configurable: true,
});

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(),
      update: vi.fn(),
      select: vi.fn(),
      single: vi.fn(),
      eq: vi.fn(),
    })),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    form: 'form',
    section: 'section',
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock react-dropzone
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(() => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false,
  })),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
