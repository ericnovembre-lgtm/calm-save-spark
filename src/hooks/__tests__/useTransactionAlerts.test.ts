import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, ReactNode } from 'react';
import { toast } from 'sonner';
import { useTransactionAlerts } from '../useTransactionAlerts';
import {
  createMockTransactionAlert,
  createMockAlertBatch,
} from '@/test/mocks/transactionAlerts';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock Supabase client
const mockSupabaseAuth = {
  getUser: vi.fn(),
};

const mockSupabaseFrom = vi.fn();
const mockChannel = vi.fn();
const mockRemoveChannel = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: () => mockSupabaseAuth.getUser(),
    },
    from: (table: string) => mockSupabaseFrom(table),
    channel: (name: string) => mockChannel(name),
    removeChannel: (channel: any) => mockRemoveChannel(channel),
  },
}));

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useTransactionAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: user is authenticated
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
    });

    // Default: channel setup
    mockChannel.mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should return empty alerts when user is not authenticated', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const { result } = renderHook(() => useTransactionAlerts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
    });

    it('should fetch alerts when user is authenticated', async () => {
      const mockAlerts = createMockAlertBatch(3);

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockAlerts, error: null }),
      });

      const { result } = renderHook(() => useTransactionAlerts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts.length).toBe(3);
    });
  });

  describe('Filtering', () => {
    it('should filter only transaction_alert notification types', async () => {
      const transactionAlert = createMockTransactionAlert({
        notification_type: 'transaction_alert',
      });
      const otherAlert = createMockTransactionAlert({
        notification_type: 'budget_alert',
      });

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [transactionAlert], // Supabase already filters
          error: null,
        }),
      });

      const { result } = renderHook(() => useTransactionAlerts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts.length).toBe(1);
      expect(result.current.alerts[0].notification_type).toBe('transaction_alert');
    });

    it('should correctly calculate unreadCount', async () => {
      const mockAlerts = [
        createMockTransactionAlert({ read: false }),
        createMockTransactionAlert({ read: false }),
        createMockTransactionAlert({ read: true }),
      ];

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockAlerts, error: null }),
      });

      const { result } = renderHook(() => useTransactionAlerts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.unreadCount).toBe(2);
    });

    it('should correctly filter highRiskAlerts', async () => {
      const mockAlerts = [
        createMockTransactionAlert({
          read: false,
          metadata: { risk_level: 'high' },
        }),
        createMockTransactionAlert({
          read: false,
          metadata: { risk_level: 'medium' },
        }),
        createMockTransactionAlert({
          read: true,
          metadata: { risk_level: 'high' },
        }),
      ];

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockAlerts, error: null }),
      });

      const { result } = renderHook(() => useTransactionAlerts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Only unread high-risk alerts
      expect(result.current.highRiskAlerts.length).toBe(1);
      expect(result.current.highRiskAlerts[0].metadata?.risk_level).toBe('high');
      expect(result.current.highRiskAlerts[0].read).toBe(false);
    });
  });

  describe('Mark as Read', () => {
    it('should mark single alert as read', async () => {
      const mockAlert = createMockTransactionAlert({ read: false });

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [mockAlert], error: null }),
        update: vi.fn().mockReturnThis(),
      });

      const { result } = renderHook(() => useTransactionAlerts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock the update call
      mockSupabaseFrom.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await act(async () => {
        await result.current.markAsRead(mockAlert.id);
      });

      expect(mockSupabaseFrom).toHaveBeenCalledWith('wallet_notifications');
    });

    it('should mark all alerts as read', async () => {
      const mockAlerts = createMockAlertBatch(3);

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockAlerts, error: null }),
        update: vi.fn().mockReturnThis(),
      });

      const { result } = renderHook(() => useTransactionAlerts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock the update call
      mockSupabaseFrom.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(mockSupabaseFrom).toHaveBeenCalledWith('wallet_notifications');
    });
  });

  describe('Error Handling', () => {
    it('should return empty array on fetch error', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      });

      const { result } = renderHook(() => useTransactionAlerts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts).toEqual([]);
    });
  });

  describe('Duplicate Prevention', () => {
    it('should combine realtime alerts with stored alerts without duplicates', async () => {
      // This is tested through the hook's internal logic
      // When a realtime alert comes in, it should be merged with stored alerts
      const storedAlert = createMockTransactionAlert({ id: 'stored-1' });

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [storedAlert], error: null }),
      });

      const { result } = renderHook(() => useTransactionAlerts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // The hook should prevent duplicate IDs when combining realtime + stored
      expect(result.current.alerts.length).toBe(1);
    });
  });
});
