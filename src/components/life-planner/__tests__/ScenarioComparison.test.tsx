import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { ScenarioComparison } from '../ScenarioComparison';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ScenarioComparison', () => {
  const mockScenarios = [
    {
      id: '1',
      life_plan_id: 'plan-1',
      scenario_name: 'Budget Option',
      description: 'Most affordable option',
      is_selected: false,
      parameters: { timeline_months: 12 },
      projected_outcomes: {
        total_cost: 15000,
        monthly_savings_needed: 1250,
        timeline_months: 12
      }
    }
  ];

  it('renders empty state when no scenarios exist', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      })
    });

    const { findByText } = renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

    expect(await findByText(/no scenarios available/i)).toBeInTheDocument();
  });

  it('renders scenario comparison when data is available', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockScenarios,
          error: null
        })
      })
    });

    const { findByText } = renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

    expect(await findByText('Budget Option')).toBeInTheDocument();
  });

  it('renders cost comparison chart', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockScenarios,
          error: null
        })
      })
    });

    const { findByText } = renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

    expect(await findByText('Cost Comparison')).toBeInTheDocument();
  });
});
