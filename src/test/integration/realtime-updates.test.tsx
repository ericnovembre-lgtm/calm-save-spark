import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBudgetRealtime } from '@/hooks/useBudgetRealtime';
import { supabase } from '@/integrations/supabase/client';

describe('Real-time Updates - Integration Test', () => {
  let queryClient: QueryClient;
  let mockChannel: any;
  let mockSubscribe: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    mockSubscribe = vi.fn().mockReturnValue({ unsubscribe: vi.fn() });
    mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: mockSubscribe,
    };

    (supabase as any).channel = vi.fn(() => mockChannel);
    (supabase as any).removeChannel = vi.fn();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('subscribes to budget_spending changes', () => {
    const userId = 'test-user-123';
    
    renderHook(() => useBudgetRealtime(userId), { wrapper });

    expect(supabase.channel).toHaveBeenCalledWith('budget_spending_changes');
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: '*',
        schema: 'public',
        table: 'budget_spending',
        filter: `user_id=eq.${userId}`,
      }),
      expect.any(Function)
    );
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it('subscribes to user_budgets changes', () => {
    const userId = 'test-user-456';
    
    renderHook(() => useBudgetRealtime(userId), { wrapper });

    expect(supabase.channel).toHaveBeenCalledWith('user_budgets_changes');
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: '*',
        schema: 'public',
        table: 'user_budgets',
        filter: `user_id=eq.${userId}`,
      }),
      expect.any(Function)
    );
  });

  it('subscribes to transactions changes', () => {
    const userId = 'test-user-789';
    
    renderHook(() => useBudgetRealtime(userId), { wrapper });

    expect(supabase.channel).toHaveBeenCalledWith('transactions_changes');
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${userId}`,
      }),
      expect.any(Function)
    );
  });

  it('invalidates queries when spending data changes', async () => {
    const userId = 'test-user-123';
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useBudgetRealtime(userId), { wrapper });

    // Get the callback function passed to the 'on' method
    const onCallback = mockChannel.on.mock.calls.find(
      (call: any) => call[1]?.table === 'budget_spending'
    )?.[2];

    expect(onCallback).toBeDefined();

    // Simulate a database change
    onCallback();

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['budget_spending', userId],
      });
    });
  });

  it('invalidates queries when budget data changes', async () => {
    const userId = 'test-user-456';
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useBudgetRealtime(userId), { wrapper });

    const onCallback = mockChannel.on.mock.calls.find(
      (call: any) => call[1]?.table === 'user_budgets'
    )?.[2];

    onCallback();

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['user_budgets', userId],
      });
    });
  });

  it('invalidates spending queries when transactions change', async () => {
    const userId = 'test-user-789';
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useBudgetRealtime(userId), { wrapper });

    const onCallback = mockChannel.on.mock.calls.find(
      (call: any) => call[1]?.table === 'transactions'
    )?.[2];

    onCallback();

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['budget_spending', userId],
      });
    });
  });

  it('cleans up subscriptions on unmount', () => {
    const userId = 'test-user-cleanup';
    const removeChannelSpy = supabase.removeChannel as any;

    const { unmount } = renderHook(() => useBudgetRealtime(userId), { wrapper });

    unmount();

    // Should remove all 3 channels (spending, budgets, transactions)
    expect(removeChannelSpy).toHaveBeenCalledTimes(3);
  });

  it('does not subscribe when userId is undefined', () => {
    renderHook(() => useBudgetRealtime(undefined), { wrapper });

    expect(supabase.channel).not.toHaveBeenCalled();
  });

  it('handles multiple rapid changes efficiently', async () => {
    const userId = 'test-user-rapid';
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useBudgetRealtime(userId), { wrapper });

    const spendingCallback = mockChannel.on.mock.calls.find(
      (call: any) => call[1]?.table === 'budget_spending'
    )?.[2];

    // Simulate rapid changes
    spendingCallback();
    spendingCallback();
    spendingCallback();

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(3);
    });
  });
});
