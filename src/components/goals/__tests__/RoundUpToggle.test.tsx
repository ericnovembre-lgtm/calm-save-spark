import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '@/test/utils';
import { RoundUpToggle } from '../RoundUpToggle';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const mockSupabase = supabase as any;

describe('RoundUpToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
  });

  it('renders round-up savings label', () => {
    renderWithProviders(<RoundUpToggle goalId="goal-123" />);

    expect(screen.getByText('Round-Up Savings')).toBeInTheDocument();
  });

  it('displays description text', () => {
    renderWithProviders(<RoundUpToggle goalId="goal-123" />);

    expect(screen.getByText(/Automatically save change from every purchase/i)).toBeInTheDocument();
  });

  it('renders toggle switch', () => {
    renderWithProviders(<RoundUpToggle goalId="goal-123" />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
    expect(toggle).not.toBeChecked();
  });

  it('shows toggle as enabled when existingRule is active', () => {
    const existingRule = {
      id: 'rule-123',
      active: true,
      multiplier: 2,
      total_saved: 150,
    };

    renderWithProviders(
      <RoundUpToggle goalId="goal-123" existingRule={existingRule} />
    );

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
  });

  it('displays multiplier slider when enabled', () => {
    const existingRule = {
      id: 'rule-123',
      active: true,
      multiplier: 2,
      total_saved: 150,
    };

    renderWithProviders(
      <RoundUpToggle goalId="goal-123" existingRule={existingRule} />
    );

    expect(screen.getByText('Multiplier')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
  });

  it('displays total saved amount when enabled', () => {
    const existingRule = {
      id: 'rule-123',
      active: true,
      multiplier: 1,
      total_saved: 150,
    };

    renderWithProviders(
      <RoundUpToggle goalId="goal-123" existingRule={existingRule} />
    );

    expect(screen.getByText(/Total Saved via Round-Ups/i)).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('formats total saved with dollar sign icon', () => {
    const existingRule = {
      id: 'rule-123',
      active: true,
      multiplier: 1,
      total_saved: 1250.50,
    };

    const { container } = renderWithProviders(
      <RoundUpToggle goalId="goal-123" existingRule={existingRule} />
    );

    expect(screen.getByText('$1,250.50')).toBeInTheDocument();
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('does not show slider when toggle is off', () => {
    renderWithProviders(<RoundUpToggle goalId="goal-123" />);

    expect(screen.queryByText('Multiplier')).not.toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = renderWithProviders(<RoundUpToggle goalId="goal-123" />);

    const wrapper = container.querySelector('.bg-accent\\/50');
    expect(wrapper).toBeInTheDocument();
  });
});
