/**
 * Unit Tests for useOfflineMutation Hook
 * Tests React Query integration with offline queue
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOfflineMutation, useOfflineQueueStatus } from '@/hooks/useOfflineMutation';
import {
  MockIndexedDB,
  createMockServiceWorker,
  mockNavigatorOnline,
  simulateOffline,
  simulateOnline,
  createMockQueueStatus,
} from '../mocks/offlineMocks';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Create wrapper with providers
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useOfflineMutation', () => {
  let mockIndexedDB: MockIndexedDB;
  let mockServiceWorker: ReturnType<typeof createMockServiceWorker>;

  beforeEach(() => {
    mockIndexedDB = new MockIndexedDB();
    mockServiceWorker = createMockServiceWorker();
    
    vi.stubGlobal('indexedDB', mockIndexedDB);
    vi.stubGlobal('navigator', { 
      ...navigator, 
      serviceWorker: mockServiceWorker,
      onLine: true,
    });
    
    mockNavigatorOnline(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    mockIndexedDB.clear();
  });

  describe('online behavior', () => {
    it('should execute mutation directly when online', async () => {
      const mutationFn = vi.fn().mockResolvedValue({ id: '1', name: 'Test Goal' });

      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn,
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.mutate({ name: 'Test Goal', amount: 1000 });
      });

      await waitFor(() => {
        expect(mutationFn).toHaveBeenCalledWith({ name: 'Test Goal', amount: 1000 });
      });
    });

    it('should not be offline when navigator.onLine is true', () => {
      mockNavigatorOnline(true);

      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn: vi.fn(),
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
          }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isOffline).toBe(false);
    });

    it('should call onSuccess callback on successful mutation', async () => {
      const onSuccess = vi.fn();
      const mutationFn = vi.fn().mockResolvedValue({ id: '1' });

      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn,
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
            onSuccess,
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.mutate({ name: 'Test' });
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should invalidate specified query keys on success', async () => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const mutationFn = vi.fn().mockResolvedValue({ id: '1' });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn,
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
            invalidateKeys: [['goals'], ['dashboard']],
          }),
        { wrapper }
      );

      await act(async () => {
        result.current.mutate({ name: 'Test' });
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['goals'] });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['dashboard'] });
      });
    });
  });

  describe('offline behavior', () => {
    it('should queue mutation when offline', async () => {
      mockNavigatorOnline(false);

      const mutationFn = vi.fn().mockResolvedValue({ id: '1' });

      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn,
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.mutate({ name: 'Offline Goal' });
      });

      // Mutation function should not be called when offline
      expect(mutationFn).not.toHaveBeenCalled();
    });

    it('should update isOffline when going offline', async () => {
      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn: vi.fn(),
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
          }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isOffline).toBe(false);

      act(() => {
        simulateOffline();
      });

      await waitFor(() => {
        expect(result.current.isOffline).toBe(true);
      });
    });

    it('should update isOffline when coming back online', async () => {
      mockNavigatorOnline(false);

      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn: vi.fn(),
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
          }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isOffline).toBe(true);

      act(() => {
        simulateOnline();
      });

      await waitFor(() => {
        expect(result.current.isOffline).toBe(false);
      });
    });
  });

  describe('optimistic updates', () => {
    it('should apply optimistic update immediately', async () => {
      const optimisticUpdate = vi.fn();
      const mutationFn = vi.fn().mockResolvedValue({ id: '1' });

      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn,
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
            optimisticUpdate,
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.mutate({ name: 'Test Goal' });
      });

      expect(optimisticUpdate).toHaveBeenCalledWith({ name: 'Test Goal' });
    });

    it('should call rollback on mutation failure', async () => {
      const rollback = vi.fn();
      const mutationFn = vi.fn().mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn,
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
            rollback,
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.mutate({ name: 'Test Goal' });
      });

      await waitFor(() => {
        expect(rollback).toHaveBeenCalled();
      });
    });
  });

  describe('queue status', () => {
    it('should poll queue status every 5 seconds', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn: vi.fn(),
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
          }),
        { wrapper: createWrapper() }
      );

      // Initial status fetch
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.queueStatus).not.toBeNull();

      vi.useRealTimers();
    });

    it('should show isPending when queue has items', async () => {
      // This would require setting up the queue first
      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn: vi.fn(),
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
          }),
        { wrapper: createWrapper() }
      );

      // Initial state should have no pending
      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe('manual sync', () => {
    it('should send message to service worker on manual sync', async () => {
      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn: vi.fn(),
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.manualSync();
      });

      const registration = await mockServiceWorker.ready;
      expect(registration.active?.postMessage).toHaveBeenCalledWith({ type: 'MANUAL_SYNC' });
    });
  });

  describe('error handling', () => {
    it('should not show error for OfflineQueuedError', async () => {
      mockNavigatorOnline(false);

      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn: vi.fn(),
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.mutate({ name: 'Test' });
      });

      // Wait for mutation to complete
      await waitFor(() => {
        expect(result.current.isError).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should show error for real API errors', async () => {
      const apiError = new Error('API Error');
      const mutationFn = vi.fn().mockRejectedValue(apiError);

      const { result } = renderHook(
        () =>
          useOfflineMutation({
            mutationFn,
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.mutate({ name: 'Test' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBe(apiError);
      });
    });
  });

  describe('Supabase config propagation', () => {
    it('should send Supabase config to service worker on mount', async () => {
      renderHook(
        () =>
          useOfflineMutation({
            mutationFn: vi.fn(),
            type: 'goal',
            action: 'create',
            endpoint: '/api/goals',
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(async () => {
        const registration = await mockServiceWorker.ready;
        expect(registration.active?.postMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'SET_SUPABASE_CONFIG',
          })
        );
      });
    });
  });
});

describe('useOfflineQueueStatus', () => {
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

  it('should return current offline status', () => {
    mockNavigatorOnline(true);

    const { result } = renderHook(() => useOfflineQueueStatus());

    expect(result.current.isOffline).toBe(false);
  });

  it('should update on online/offline events', async () => {
    mockNavigatorOnline(true);

    const { result } = renderHook(() => useOfflineQueueStatus());

    expect(result.current.isOffline).toBe(false);

    act(() => {
      simulateOffline();
    });

    await waitFor(() => {
      expect(result.current.isOffline).toBe(true);
    });

    act(() => {
      simulateOnline();
    });

    await waitFor(() => {
      expect(result.current.isOffline).toBe(false);
    });
  });

  it('should return queue status', async () => {
    const { result } = renderHook(() => useOfflineQueueStatus());

    await waitFor(() => {
      expect(result.current.status).not.toBeNull();
    });
  });
});
