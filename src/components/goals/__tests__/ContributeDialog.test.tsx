import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/utils';
import { ContributeDialog } from '../ContributeDialog';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockSupabase = supabase as any;

describe('ContributeDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    goalId: 'goal-123',
    goalName: 'Emergency Fund',
    currentAmount: 2500,
    targetAmount: 10000,
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with goal information', () => {
    renderWithProviders(<ContributeDialog {...defaultProps} />);

    expect(screen.getByText('Add Funds to Emergency Fund')).toBeInTheDocument();
    expect(screen.getByText('$7,500 remaining to reach your goal')).toBeInTheDocument();
  });

  it('displays amount input field', () => {
    renderWithProviders(<ContributeDialog {...defaultProps} />);

    const amountInput = screen.getByLabelText(/Amount/i);
    expect(amountInput).toBeInTheDocument();
    expect(amountInput).toHaveAttribute('type', 'number');
  });

  it('displays date input field with default date', () => {
    renderWithProviders(<ContributeDialog {...defaultProps} />);

    const dateInput = screen.getByLabelText(/Date/i);
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveAttribute('type', 'date');
  });

  it('displays optional note field', () => {
    renderWithProviders(<ContributeDialog {...defaultProps} />);

    const noteInput = screen.getByLabelText(/Note/i);
    expect(noteInput).toBeInTheDocument();
  });

  it('calculates remaining amount correctly', () => {
    renderWithProviders(<ContributeDialog {...defaultProps} />);

    // targetAmount (10000) - currentAmount (2500) = 7500
    expect(screen.getByText('$7,500 remaining to reach your goal')).toBeInTheDocument();
  });

  it('shows submit button with amount display', () => {
    renderWithProviders(<ContributeDialog {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /Add \$0/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('closes when not open', () => {
    const { container } = renderWithProviders(
      <ContributeDialog {...defaultProps} open={false} />
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('handles large remaining amounts', () => {
    renderWithProviders(
      <ContributeDialog
        {...defaultProps}
        currentAmount={0}
        targetAmount={50000}
      />
    );

    expect(screen.getByText('$50,000 remaining to reach your goal')).toBeInTheDocument();
  });

  it('handles nearly complete goals', () => {
    renderWithProviders(
      <ContributeDialog
        {...defaultProps}
        currentAmount={9950}
        targetAmount={10000}
      />
    );

    expect(screen.getByText('$50 remaining to reach your goal')).toBeInTheDocument();
  });
});
