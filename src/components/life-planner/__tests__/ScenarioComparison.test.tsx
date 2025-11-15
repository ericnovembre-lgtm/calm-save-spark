import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
        timeline_months: 12,
        pros_cons: {
          pros: ['Lower cost', 'Faster timeline'],
          cons: ['Fewer amenities']
        }
      }
    },
    {
      id: '2',
      life_plan_id: 'plan-1',
      scenario_name: 'Premium Option',
      description: 'High-end experience',
      is_selected: true,
      parameters: { timeline_months: 24 },
      projected_outcomes: {
        total_cost: 50000,
        monthly_savings_needed: 2083,
        timeline_months: 24,
        pros_cons: {
          pros: ['Best quality', 'All amenities'],
          cons: ['Higher cost', 'Longer timeline']
        }
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders scenario comparison when data is available', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText('Budget Option')).toBeInTheDocument();
        expect(screen.getByText('Premium Option')).toBeInTheDocument();
      });
    });

    it('renders empty state when no scenarios exist', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText(/no scenarios available/i)).toBeInTheDocument();
      });
    });

    it('displays scenario descriptions', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText('Most affordable option')).toBeInTheDocument();
        expect(screen.getByText('High-end experience')).toBeInTheDocument();
      });
    });
  });

  describe('Cost Comparison Chart', () => {
    it('renders cost comparison chart', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText('Cost Comparison')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario Details', () => {
    it('displays total cost for each scenario', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText('$15,000')).toBeInTheDocument();
        expect(screen.getByText('$50,000')).toBeInTheDocument();
      });
    });

    it('displays monthly savings needed', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText('$1,250')).toBeInTheDocument();
        expect(screen.getByText('$2,083')).toBeInTheDocument();
      });
    });

    it('displays timeline in months', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText('12 months')).toBeInTheDocument();
        expect(screen.getByText('24 months')).toBeInTheDocument();
      });
    });

    it('shows selected scenario indicator', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      const { container } = renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        const checkIcon = container.querySelector('.text-green-500');
        expect(checkIcon).toBeInTheDocument();
      });
    });
  });

  describe('Pros and Cons', () => {
    it('displays pros for each scenario', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText(/lower cost/i)).toBeInTheDocument();
        expect(screen.getByText(/best quality/i)).toBeInTheDocument();
      });
    });

    it('displays cons for each scenario', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText(/fewer amenities/i)).toBeInTheDocument();
        expect(screen.getByText(/higher cost/i)).toBeInTheDocument();
      });
    });

    it('renders pros section with correct label', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText('Pros:')).toBeInTheDocument();
      });
    });

    it('renders cons section with correct label', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText('Cons:')).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('renders select scenario button for each scenario', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        const selectButtons = screen.getAllByRole('button', { name: /select scenario/i });
        expect(selectButtons.length).toBe(mockScenarios.length);
      });
    });
  });

  describe('Data Handling', () => {
    it('handles scenarios without projected outcomes', async () => {
      const scenarioWithoutOutcomes = [{
        id: '1',
        life_plan_id: 'plan-1',
        scenario_name: 'Basic Option',
        description: 'Simple plan',
        is_selected: false,
        parameters: {},
        projected_outcomes: null
      }];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: scenarioWithoutOutcomes,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText('Basic Option')).toBeInTheDocument();
      });
    });

    it('handles missing pros_cons data', async () => {
      const scenarioWithoutProsCons = [{
        id: '1',
        life_plan_id: 'plan-1',
        scenario_name: 'Simple Option',
        description: 'Basic plan',
        is_selected: false,
        parameters: {},
        projected_outcomes: {
          total_cost: 10000,
          monthly_savings_needed: 500,
          timeline_months: 20
        }
      }];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: scenarioWithoutProsCons,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getByText('Simple Option')).toBeInTheDocument();
      });
    });
  });

  describe('Layout', () => {
    it('renders scenarios in a grid layout', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      const { container } = renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles query errors gracefully', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      // Component should not crash
      await waitFor(() => {
        expect(screen.queryByText('Budget Option')).not.toBeInTheDocument();
      });
    });
  });

  describe('Labels', () => {
    it('displays correct field labels', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockScenarios,
            error: null
          })
        })
      });

      renderWithQueryClient(<ScenarioComparison lifePlanId="plan-1" />);

      await waitFor(() => {
        expect(screen.getAllByText('Total Cost').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Monthly Savings').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Timeline').length).toBeGreaterThan(0);
      });
    });
  });
});
