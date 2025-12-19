import { create } from 'zustand';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncError {
  id: string;
  indexName: string;
  error: string;
  timestamp: Date;
}

interface AlgoliaSyncState {
  status: SyncStatus;
  pendingOperations: Set<string>;
  lastSynced: Date | null;
  errors: SyncError[];
  
  // Actions
  startOperation: (operationId: string) => void;
  completeOperation: (operationId: string) => void;
  failOperation: (operationId: string, indexName: string, error: string) => void;
  clearErrors: () => void;
  dismissError: (errorId: string) => void;
}

export const useAlgoliaSyncStore = create<AlgoliaSyncState>((set, get) => ({
  status: 'idle',
  pendingOperations: new Set(),
  lastSynced: null,
  errors: [],

  startOperation: (operationId: string) => {
    set((state) => {
      const newPending = new Set(state.pendingOperations);
      newPending.add(operationId);
      return {
        pendingOperations: newPending,
        status: 'syncing',
      };
    });
  },

  completeOperation: (operationId: string) => {
    set((state) => {
      const newPending = new Set(state.pendingOperations);
      newPending.delete(operationId);
      
      const isComplete = newPending.size === 0;
      return {
        pendingOperations: newPending,
        status: isComplete ? 'success' : 'syncing',
        lastSynced: isComplete ? new Date() : state.lastSynced,
      };
    });

    // Reset to idle after success feedback
    if (get().pendingOperations.size === 0) {
      setTimeout(() => {
        if (get().pendingOperations.size === 0 && get().status === 'success') {
          set({ status: 'idle' });
        }
      }, 3000);
    }
  },

  failOperation: (operationId: string, indexName: string, error: string) => {
    set((state) => {
      const newPending = new Set(state.pendingOperations);
      newPending.delete(operationId);
      
      const newError: SyncError = {
        id: operationId,
        indexName,
        error,
        timestamp: new Date(),
      };

      return {
        pendingOperations: newPending,
        status: newPending.size === 0 ? 'error' : 'syncing',
        errors: [...state.errors.slice(-9), newError], // Keep last 10 errors
      };
    });
  },

  clearErrors: () => {
    set({ errors: [], status: 'idle' });
  },

  dismissError: (errorId: string) => {
    set((state) => ({
      errors: state.errors.filter((e) => e.id !== errorId),
      status: state.errors.length <= 1 ? 'idle' : state.status,
    }));
  },
}));
