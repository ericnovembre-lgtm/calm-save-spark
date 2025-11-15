import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/utils';
import { GoalSavingsOptimizer } from '../GoalSavingsOptimizer';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const mockSupabase = supabase as any;

describe('GoalSavingsOptimizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state with optimize button', () => {
    renderWithProviders(<GoalSavingsOptimizer />);

    expect(screen.getByText('Smart Savings Optimizer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Optimize My Goals/i })).toBeInTheDocument();
  });

  it('displays description text', () => {
    renderWithProviders(<GoalSavingsOptimizer />);

    expect(screen.getByText(/Let AI calculate the optimal weekly amount/i)).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    mockSupabase.functions.invoke.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithProviders(<GoalSavingsOptimizer />);

    const button = screen.getByRole('button', { name: /Optimize My Goals/i });
    button.click();

    await waitFor(() => {
      expect(screen.getByText(/Analyzing/i)).toBeInTheDocument();
    });
  });

  it('displays sparkles icon', () => {
    const { container } = renderWithProviders(<GoalSavingsOptimizer />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('has gradient background styling', () => {
    const { container } = renderWithProviders(<GoalSavingsOptimizer />);

    const card = container.querySelector('.bg-gradient-to-br');
    expect(card).toBeInTheDocument();
  });

  it('has primary border styling', () => {
    const { container } = renderWithProviders(<GoalSavingsOptimizer />);

    const card = container.querySelector('.border-primary\\/20');
    expect(card).toBeInTheDocument();
  });
});
