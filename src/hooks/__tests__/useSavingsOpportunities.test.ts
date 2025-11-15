import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSavingsOpportunities } from '../useSavingsOpportunities';

describe('useSavingsOpportunities', () => {
  it('should detect under-utilized budgets', () => {
    const budgets = [
      { id: '1', name: 'Food', total_limit: 1000 }
    ];
    const spending = {
      '1': { spent_amount: 400 }
    };

    const { result } = renderHook(() => useSavingsOpportunities(budgets, spending));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Under-utilized Budget');
    expect(result.current[0].confidence).toBe('high');
  });

  it('should detect overspending', () => {
    const budgets = [
      { id: '1', name: 'Food', total_limit: 1000 }
    ];
    const spending = {
      '1': { spent_amount: 1200 }
    };

    const { result } = renderHook(() => useSavingsOpportunities(budgets, spending));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Overspending Alert');
  });

  it('should detect optimization opportunities', () => {
    const budgets = [
      { id: '1', name: 'Food', total_limit: 1000 },
      { id: '2', name: 'Transport', total_limit: 500 }
    ];
    const spending = {
      '1': { spent_amount: 650 },
      '2': { spent_amount: 100 }
    };

    const { result } = renderHook(() => useSavingsOpportunities(budgets, spending));

    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.some(o => o.potentialSavings > 0)).toBe(true);
  });

  it('should handle empty budgets', () => {
    const { result } = renderHook(() => useSavingsOpportunities([], {}));

    expect(result.current).toHaveLength(0);
  });

  it('should sort opportunities by potential savings', () => {
    const budgets = [
      { id: '1', name: 'Food', total_limit: 1000 },
      { id: '2', name: 'Transport', total_limit: 500 }
    ];
    const spending = {
      '1': { spent_amount: 300 },
      '2': { spent_amount: 200 }
    };

    const { result } = renderHook(() => useSavingsOpportunities(budgets, spending));

    if (result.current.length > 1) {
      expect(result.current[0].potentialSavings)
        .toBeGreaterThanOrEqual(result.current[1].potentialSavings);
    }
  });
});
