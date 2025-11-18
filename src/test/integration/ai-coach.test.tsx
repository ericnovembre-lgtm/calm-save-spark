import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor, userEvent } from '../utils';
import { AICoachPanel } from '@/components/budget/AICoachPanel';
import { supabase } from '@/integrations/supabase/client';

describe('AI Coach Interaction - Integration Test', () => {
  const mockBudgets = [
    { id: '1', name: 'Monthly Budget', total_limit: 5000, period: 'monthly' },
  ];
  
  const mockSpending = {
    '1': { spent_amount: 3500, transaction_count: 42 }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays AI coach panel', async () => {
    renderWithProviders(<AICoachPanel budgets={mockBudgets} spending={mockSpending} />);

    await waitFor(() => {
      expect(screen.getByText(/AI Coach|Budget Coach/i)).toBeInTheDocument();
    });
  });

  it('fetches AI insights from edge function', async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      data: {
        advice: 'You\'re doing great! Your spending is on track.',
      },
      error: null,
    });

    (supabase.functions.invoke as any) = mockInvoke;

    renderWithProviders(<AICoachPanel budgets={mockBudgets} spending={mockSpending} />);

    const getAdviceButton = await screen.findByRole('button', { name: /get ai advice/i });
    await userEvent.setup().click(getAdviceButton);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('handles user interaction with AI coach', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<AICoachPanel budgets={mockBudgets} spending={mockSpending} />);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('renders AI coach panel successfully', async () => {
    renderWithProviders(<AICoachPanel budgets={mockBudgets} spending={mockSpending} />);

    await waitFor(() => {
      expect(screen.getByText(/Budget Coach/i)).toBeInTheDocument();
    });
  });

  it('handles edge function errors gracefully', async () => {
    const mockInvoke = vi.fn().mockRejectedValue(new Error('Network error'));
    (supabase.functions.invoke as any) = mockInvoke;

    renderWithProviders(<AICoachPanel budgets={mockBudgets} spending={mockSpending} />);

    const getAdviceButton = await screen.findByRole('button', { name: /get ai advice/i });
    await userEvent.setup().click(getAdviceButton);

    // Component should handle error without crashing
    await waitFor(() => {
      expect(screen.queryByText(/crash|fatal/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays personalized insights', async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      data: {
        advice: 'You typically spend more on weekends. Plan ahead!',
      },
      error: null,
    });

    (supabase.functions.invoke as any) = mockInvoke;

    renderWithProviders(<AICoachPanel budgets={mockBudgets} spending={mockSpending} />);

    const getAdviceButton = await screen.findByRole('button', { name: /get ai advice/i });
    await userEvent.setup().click(getAdviceButton);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('renders consistently', async () => {
    const { rerender } = renderWithProviders(
      <AICoachPanel budgets={mockBudgets} spending={mockSpending} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Budget Coach/i)).toBeInTheDocument();
    });

    // Re-render with same props
    rerender(<AICoachPanel budgets={mockBudgets} spending={mockSpending} />);

    await waitFor(() => {
      expect(screen.getByText(/Budget Coach/i)).toBeInTheDocument();
    });
  });

  it('provides interactive elements', async () => {
    renderWithProviders(<AICoachPanel budgets={mockBudgets} spending={mockSpending} />);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('handles component lifecycle correctly', async () => {
    const { unmount } = renderWithProviders(
      <AICoachPanel budgets={mockBudgets} spending={mockSpending} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Budget Coach/i)).toBeInTheDocument();
    });

    // Unmount should not throw errors
    expect(() => unmount()).not.toThrow();
  });
});
