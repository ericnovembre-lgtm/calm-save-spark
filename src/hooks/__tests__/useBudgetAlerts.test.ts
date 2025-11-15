import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBudgetAlerts } from '../useBudgetAlerts';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('useBudgetAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should trigger warning alert at 80% budget usage', () => {
    const budgets = [
      { id: '1', name: 'Food', total_limit: 1000 }
    ];
    const spending = {
      '1': { spent_amount: 800 }
    };

    renderHook(() => useBudgetAlerts(budgets, spending));

    expect(toast.warning).toHaveBeenCalledWith(
      expect.stringContaining("You've used 80% of your Food budget"),
      expect.any(Object)
    );
  });

  it('should trigger danger alert at 100% budget usage', () => {
    const budgets = [
      { id: '1', name: 'Food', total_limit: 1000 }
    ];
    const spending = {
      '1': { spent_amount: 1100 }
    };

    renderHook(() => useBudgetAlerts(budgets, spending));

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("You've exceeded your Food budget"),
      expect.any(Object)
    );
  });

  it('should not trigger duplicate alerts', () => {
    const budgets = [
      { id: '1', name: 'Food', total_limit: 1000 }
    ];
    const spending = {
      '1': { spent_amount: 800 }
    };

    const { rerender } = renderHook(() => useBudgetAlerts(budgets, spending));
    rerender();

    expect(toast.warning).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple budgets', () => {
    const budgets = [
      { id: '1', name: 'Food', total_limit: 1000 },
      { id: '2', name: 'Transport', total_limit: 500 }
    ];
    const spending = {
      '1': { spent_amount: 850 },
      '2': { spent_amount: 550 }
    };

    renderHook(() => useBudgetAlerts(budgets, spending));

    expect(toast.warning).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
