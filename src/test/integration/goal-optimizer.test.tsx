import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/utils';
import { GoalOptimizer } from '@/components/goals/GoalOptimizer';

const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
  },
}));

describe('GoalOptimizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockInvoke.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<GoalOptimizer />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays summary statistics', async () => {
    const mockData = {
      optimizations: [],
      recommendations: [],
      summary: {
        totalGoals: 5,
        monthlyDisposable: 1500,
        totalMonthlyAllocation: 800,
        averageCompletionTime: 18
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<GoalOptimizer />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('$1,500')).toBeInTheDocument();
      expect(screen.getByText('$800')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
    });
  });

  it('displays optimization cards with progress indicators', async () => {
    const mockData = {
      optimizations: [
        {
          goalId: '1',
          goalName: 'Emergency Fund',
          currentAmount: 3000,
          targetAmount: 10000,
          remainingAmount: 7000,
          suggestedMonthlyAmount: 400,
          suggestedWeeklyAmount: 100,
          estimatedCompletion: '2025-08-01',
          priorityScore: 95,
          onTrack: true
        },
        {
          goalId: '2',
          goalName: 'Vacation Fund',
          currentAmount: 500,
          targetAmount: 3000,
          remainingAmount: 2500,
          suggestedMonthlyAmount: 200,
          suggestedWeeklyAmount: 50,
          estimatedCompletion: '2026-02-01',
          priorityScore: 70,
          onTrack: false
        }
      ],
      recommendations: [],
      summary: {
        totalGoals: 2,
        monthlyDisposable: 1200,
        totalMonthlyAllocation: 600,
        averageCompletionTime: 15
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<GoalOptimizer />);

    await waitFor(() => {
      expect(screen.getByText(/emergency fund/i)).toBeInTheDocument();
      expect(screen.getByText(/vacation fund/i)).toBeInTheDocument();
    });

    expect(screen.getByText('$3,000')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument();
    expect(screen.getByText('$400')).toBeInTheDocument();
  });

  it('displays on-track and behind status indicators', async () => {
    const mockData = {
      optimizations: [
        {
          goalId: '1',
          goalName: 'Goal On Track',
          currentAmount: 5000,
          targetAmount: 10000,
          remainingAmount: 5000,
          suggestedMonthlyAmount: 500,
          suggestedWeeklyAmount: 125,
          estimatedCompletion: '2025-06-01',
          priorityScore: 85,
          onTrack: true
        },
        {
          goalId: '2',
          goalName: 'Goal Behind',
          currentAmount: 1000,
          targetAmount: 10000,
          remainingAmount: 9000,
          suggestedMonthlyAmount: 300,
          suggestedWeeklyAmount: 75,
          estimatedCompletion: '2027-01-01',
          priorityScore: 60,
          onTrack: false
        }
      ],
      recommendations: [],
      summary: {
        totalGoals: 2,
        monthlyDisposable: 1500,
        totalMonthlyAllocation: 800,
        averageCompletionTime: 20
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<GoalOptimizer />);

    await waitFor(() => {
      expect(screen.getByText(/on track/i)).toBeInTheDocument();
      expect(screen.getByText(/behind schedule/i)).toBeInTheDocument();
    });
  });

  it('displays recommendations with priority badges', async () => {
    const mockData = {
      optimizations: [],
      recommendations: [
        {
          type: 'rebalance',
          priority: 'high',
          title: 'Rebalance High Priority Goal',
          description: 'Increase allocation to emergency fund',
          action: 'Increase monthly contribution by $100',
          impact: '+2 months faster completion'
        },
        {
          type: 'optimize',
          priority: 'medium',
          title: 'Optimize Goal Timeline',
          description: 'Adjust vacation fund timeline',
          action: 'Reduce monthly contribution by $50',
          impact: 'Better cash flow balance'
        },
        {
          type: 'suggestion',
          priority: 'low',
          title: 'Consider New Goal',
          description: 'Start retirement savings',
          action: 'Create new goal with $200/month',
          impact: 'Long-term wealth building'
        }
      ],
      summary: {
        totalGoals: 2,
        monthlyDisposable: 1500,
        totalMonthlyAllocation: 800,
        averageCompletionTime: 15
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<GoalOptimizer />);

    await waitFor(() => {
      expect(screen.getByText(/rebalance high priority goal/i)).toBeInTheDocument();
      expect(screen.getByText(/optimize goal timeline/i)).toBeInTheDocument();
      expect(screen.getByText(/consider new goal/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
    expect(screen.getByText(/low/i)).toBeInTheDocument();
  });

  it('shows empty state when no goals exist', async () => {
    const mockData = {
      optimizations: [],
      recommendations: [],
      summary: {
        totalGoals: 0,
        monthlyDisposable: 1500,
        totalMonthlyAllocation: 0,
        averageCompletionTime: 0
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<GoalOptimizer />);

    await waitFor(() => {
      expect(screen.getByText(/no goals to optimize/i)).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Failed to optimize goals' }
    });

    renderWithProviders(<GoalOptimizer />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('displays priority scores correctly', async () => {
    const mockData = {
      optimizations: [
        {
          goalId: '1',
          goalName: 'High Priority Goal',
          currentAmount: 1000,
          targetAmount: 5000,
          remainingAmount: 4000,
          suggestedMonthlyAmount: 400,
          suggestedWeeklyAmount: 100,
          estimatedCompletion: '2025-12-01',
          priorityScore: 95,
          onTrack: true
        },
        {
          goalId: '2',
          goalName: 'Medium Priority Goal',
          currentAmount: 2000,
          targetAmount: 8000,
          remainingAmount: 6000,
          suggestedMonthlyAmount: 300,
          suggestedWeeklyAmount: 75,
          estimatedCompletion: '2026-06-01',
          priorityScore: 70,
          onTrack: true
        },
        {
          goalId: '3',
          goalName: 'Low Priority Goal',
          currentAmount: 500,
          targetAmount: 2000,
          remainingAmount: 1500,
          suggestedMonthlyAmount: 100,
          suggestedWeeklyAmount: 25,
          estimatedCompletion: '2026-02-01',
          priorityScore: 45,
          onTrack: false
        }
      ],
      recommendations: [],
      summary: {
        totalGoals: 3,
        monthlyDisposable: 2000,
        totalMonthlyAllocation: 800,
        averageCompletionTime: 12
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<GoalOptimizer />);

    await waitFor(() => {
      expect(screen.getByText('95')).toBeInTheDocument();
      expect(screen.getByText('70')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });
  });
});
