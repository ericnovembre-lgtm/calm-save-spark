/**
 * Unit Tests for Offline Mutation Queue
 * Tests IndexedDB operations, deduplication, and background sync
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  queueMutation,
  getPendingMutations,
  getMutationsByType,
  removeMutation,
  incrementRetryCount,
  clearUserMutations,
  getQueueStatus,
  registerBackgroundSync,
  onSyncComplete,
  isOnline,
  waitForOnline,
  setSyncingState,
} from '@/lib/offline-mutation-queue';
import {
  MockIndexedDB,
  createMockServiceWorker,
  mockNavigatorOnline,
  simulateOnline,
  simulateOffline,
} from '../mocks/offlineMocks';

describe('offline-mutation-queue', () => {
  let mockIndexedDB: MockIndexedDB;

  beforeEach(() => {
    mockIndexedDB = new MockIndexedDB();
    vi.stubGlobal('indexedDB', mockIndexedDB);
    mockNavigatorOnline(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mockIndexedDB.clear();
  });

  describe('queueMutation', () => {
    it('should add a mutation to the queue', async () => {
      const mutation = await queueMutation(
        'goal',
        'create',
        '/api/goals',
        { name: 'Test Goal', amount: 1000 },
        'user-123'
      );

      expect(mutation).toMatchObject({
        type: 'goal',
        action: 'create',
        endpoint: '/api/goals',
        payload: { name: 'Test Goal', amount: 1000 },
        userId: 'user-123',
        retryCount: 0,
        maxRetries: 5,
      });
      expect(mutation.id).toBeDefined();
      expect(mutation.timestamp).toBeDefined();
      expect(mutation.signature).toBeDefined();
    });

    it('should generate unique IDs for different mutations', async () => {
      const mutation1 = await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-123');
      const mutation2 = await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 2' }, 'user-123');

      expect(mutation1.id).not.toBe(mutation2.id);
    });

    it('should handle duplicate mutations by returning existing', async () => {
      const payload = { name: 'Same Goal', amount: 500 };
      const mutation1 = await queueMutation('goal', 'create', '/api/goals', payload, 'user-123');
      const mutation2 = await queueMutation('goal', 'create', '/api/goals', payload, 'user-123');

      expect(mutation1.signature).toBe(mutation2.signature);
    });

    it('should scope mutations by user ID', async () => {
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-1');
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 2' }, 'user-2');

      const allMutations = await getPendingMutations();
      const user1Mutations = allMutations.filter((m) => m.userId === 'user-1');
      const user2Mutations = allMutations.filter((m) => m.userId === 'user-2');

      expect(user1Mutations.length).toBe(1);
      expect(user2Mutations.length).toBe(1);
    });

    it('should support different mutation types', async () => {
      const types = ['goal', 'transaction', 'budget', 'pot', 'debt', 'automation'] as const;

      for (const type of types) {
        const mutation = await queueMutation(type, 'create', `/api/${type}s`, { test: true }, 'user-123');
        expect(mutation.type).toBe(type);
      }
    });

    it('should support different action types', async () => {
      const actions = ['create', 'update', 'delete'] as const;

      for (const action of actions) {
        const mutation = await queueMutation('goal', action, '/api/goals', { id: '1' }, 'user-123');
        expect(mutation.action).toBe(action);
      }
    });
  });

  describe('getPendingMutations', () => {
    it('should return empty array when no mutations', async () => {
      const mutations = await getPendingMutations();
      expect(mutations).toEqual([]);
    });

    it('should return all pending mutations sorted by timestamp', async () => {
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-123');
      await new Promise((r) => setTimeout(r, 10));
      await queueMutation('budget', 'update', '/api/budgets', { id: '1' }, 'user-123');

      const mutations = await getPendingMutations();
      expect(mutations.length).toBe(2);
      expect(mutations[0].timestamp).toBeLessThanOrEqual(mutations[1].timestamp);
    });

    it('should return mutations from all users', async () => {
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-1');
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 2' }, 'user-2');

      const mutations = await getPendingMutations();
      expect(mutations.length).toBe(2);
    });
  });

  describe('getMutationsByType', () => {
    it('should filter mutations by type', async () => {
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-123');
      await queueMutation('budget', 'create', '/api/budgets', { name: 'Budget 1' }, 'user-123');
      await queueMutation('goal', 'update', '/api/goals', { id: '1' }, 'user-123');

      const goalMutations = await getMutationsByType('goal');
      expect(goalMutations.length).toBe(2);
      expect(goalMutations.every((m) => m.type === 'goal')).toBe(true);

      const budgetMutations = await getMutationsByType('budget');
      expect(budgetMutations.length).toBe(1);
    });

    it('should return empty array for type with no mutations', async () => {
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-123');

      const debtMutations = await getMutationsByType('debt');
      expect(debtMutations).toEqual([]);
    });
  });

  describe('removeMutation', () => {
    it('should remove mutation by ID', async () => {
      const mutation = await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-123');
      await removeMutation(mutation.id);

      const mutations = await getPendingMutations();
      expect(mutations.find((m) => m.id === mutation.id)).toBeUndefined();
    });

    it('should handle removing non-existent mutation gracefully', async () => {
      await expect(removeMutation('non-existent-id')).resolves.not.toThrow();
    });

    it('should only remove specified mutation', async () => {
      const mutation1 = await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-123');
      const mutation2 = await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 2' }, 'user-123');

      await removeMutation(mutation1.id);

      const mutations = await getPendingMutations();
      expect(mutations.length).toBe(1);
      expect(mutations[0].id).toBe(mutation2.id);
    });
  });

  describe('incrementRetryCount', () => {
    it('should increment retry count', async () => {
      const mutation = await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-123');
      const shouldContinue = await incrementRetryCount(mutation.id);

      expect(shouldContinue).toBe(true);

      const mutations = await getPendingMutations();
      const updated = mutations.find((m) => m.id === mutation.id);
      expect(updated?.retryCount).toBe(1);
    });

    it('should return false when max retries exceeded', async () => {
      const mutation = await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-123');

      // Increment to max retries
      for (let i = 0; i < 5; i++) {
        await incrementRetryCount(mutation.id);
      }

      const mutations = await getPendingMutations();
      expect(mutations.find((m) => m.id === mutation.id)).toBeUndefined();
    });

    it('should return false for non-existent mutation', async () => {
      const result = await incrementRetryCount('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('clearUserMutations', () => {
    it('should clear only specified user mutations', async () => {
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-1');
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 2' }, 'user-1');
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 3' }, 'user-2');

      const deleted = await clearUserMutations('user-1');
      expect(deleted).toBe(2);

      const mutations = await getPendingMutations();
      expect(mutations.length).toBe(1);
      expect(mutations[0].userId).toBe('user-2');
    });

    it('should return 0 when no mutations for user', async () => {
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-1');

      const deleted = await clearUserMutations('user-999');
      expect(deleted).toBe(0);
    });
  });

  describe('getQueueStatus', () => {
    it('should return correct pending count', async () => {
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-123');
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 2' }, 'user-123');

      const status = await getQueueStatus();
      expect(status.pendingCount).toBe(2);
    });

    it('should return oldest mutation', async () => {
      const oldest = await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-123');
      await new Promise((r) => setTimeout(r, 10));
      await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 2' }, 'user-123');

      const status = await getQueueStatus();
      expect(status.oldestMutation?.id).toBe(oldest.id);
    });

    it('should return null oldest when empty', async () => {
      const status = await getQueueStatus();
      expect(status.oldestMutation).toBeNull();
    });

    it('should track syncing state', async () => {
      setSyncingState(true);
      const status1 = await getQueueStatus();
      expect(status1.isSyncing).toBe(true);

      setSyncingState(false, true);
      const status2 = await getQueueStatus();
      expect(status2.isSyncing).toBe(false);
      expect(status2.lastSyncSuccess).not.toBeNull();
    });
  });

  describe('registerBackgroundSync', () => {
    it('should register sync when supported', async () => {
      const mockSW = createMockServiceWorker();
      vi.stubGlobal('navigator', { ...navigator, serviceWorker: mockSW });

      // Add sync to ServiceWorkerRegistration prototype
      Object.defineProperty(ServiceWorkerRegistration.prototype, 'sync', {
        value: { register: vi.fn() },
        configurable: true,
      });

      const result = await registerBackgroundSync('test-sync');
      expect(result).toBe(true);
    });

    it('should return false when not supported', async () => {
      vi.stubGlobal('navigator', { serviceWorker: undefined });

      const result = await registerBackgroundSync('test-sync');
      expect(result).toBe(false);
    });
  });

  describe('onSyncComplete', () => {
    it('should listen for sync completion messages', () => {
      const mockSW = createMockServiceWorker();
      vi.stubGlobal('navigator', { ...navigator, serviceWorker: mockSW });

      const callback = vi.fn();
      const cleanup = onSyncComplete(callback);

      expect(mockSW.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));

      cleanup();
      expect(mockSW.removeEventListener).toHaveBeenCalled();
    });
  });

  describe('isOnline', () => {
    it('should return true when online', () => {
      mockNavigatorOnline(true);
      expect(isOnline()).toBe(true);
    });

    it('should return false when offline', () => {
      mockNavigatorOnline(false);
      expect(isOnline()).toBe(false);
    });
  });

  describe('waitForOnline', () => {
    it('should resolve immediately when online', async () => {
      mockNavigatorOnline(true);
      await expect(waitForOnline()).resolves.toBeUndefined();
    });

    it('should wait for online event when offline', async () => {
      mockNavigatorOnline(false);

      const promise = waitForOnline();

      setTimeout(() => simulateOnline(), 50);

      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('signature generation', () => {
    it('should generate consistent signatures for same data', async () => {
      const payload = { name: 'Test', amount: 100 };
      const mutation1 = await queueMutation('goal', 'create', '/api/goals', payload, 'user-1');
      
      // Clear and re-add to test signature consistency
      await removeMutation(mutation1.id);
      const mutation2 = await queueMutation('goal', 'create', '/api/goals', payload, 'user-2');

      expect(mutation1.signature).toBe(mutation2.signature);
    });

    it('should generate different signatures for different payloads', async () => {
      const mutation1 = await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 1' }, 'user-123');
      const mutation2 = await queueMutation('goal', 'create', '/api/goals', { name: 'Goal 2' }, 'user-123');

      expect(mutation1.signature).not.toBe(mutation2.signature);
    });

    it('should generate different signatures for different actions', async () => {
      const payload = { id: '1', name: 'Test' };
      const mutation1 = await queueMutation('goal', 'create', '/api/goals', payload, 'user-123');
      await removeMutation(mutation1.id);
      const mutation2 = await queueMutation('goal', 'update', '/api/goals', payload, 'user-123');

      expect(mutation1.signature).not.toBe(mutation2.signature);
    });
  });
});
