import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/test/utils';
import { GoalAnalytics } from '../GoalAnalytics';

describe('GoalAnalytics', () => {
  const mockGoals = [
    {
      id: '1',
      name: 'Emergency Fund',
      current_amount: 2500,
      target_amount: 10000,
    },
    {
      id: '2',
      name: 'Vacation',
      current_amount: 1000,
      target_amount: 5000,
    },
    {
      id: '3',
      name: 'New Car',
      current_amount: 8500,
      target_amount: 10000,
    },
  ];

  it('renders all stat cards', () => {
    renderWithProviders(<GoalAnalytics goals={mockGoals} />);

    expect(screen.getByText('Total Saved')).toBeInTheDocument();
    expect(screen.getByText('Average Progress')).toBeInTheDocument();
    expect(screen.getByText('Active Goals')).toBeInTheDocument();
    expect(screen.getByText('Near Completion')).toBeInTheDocument();
  });

  it('calculates total saved correctly', () => {
    renderWithProviders(<GoalAnalytics goals={mockGoals} />);

    // 2500 + 1000 + 8500 = 12000
    expect(screen.getByText('$12,000.00')).toBeInTheDocument();
  });

  it('calculates total target correctly', () => {
    renderWithProviders(<GoalAnalytics goals={mockGoals} />);

    // of $25,000 target
    expect(screen.getByText('of $25,000 target')).toBeInTheDocument();
  });

  it('displays active goals count', () => {
    renderWithProviders(<GoalAnalytics goals={mockGoals} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('being tracked')).toBeInTheDocument();
  });

  it('identifies goals near completion (80%+)', () => {
    renderWithProviders(<GoalAnalytics goals={mockGoals} />);

    // Goal 3 is at 85% (8500/10000), so count should be 1
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('80%+ complete')).toBeInTheDocument();
  });

  it('calculates average progress', () => {
    renderWithProviders(<GoalAnalytics goals={mockGoals} />);

    // Goal 1: 25%, Goal 2: 20%, Goal 3: 85% = avg 43.3%
    expect(screen.getByText('43.3%')).toBeInTheDocument();
  });

  it('handles empty goals array', () => {
    renderWithProviders(<GoalAnalytics goals={[]} />);

    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays correct icons', () => {
    const { container } = renderWithProviders(<GoalAnalytics goals={mockGoals} />);

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('uses grid layout', () => {
    const { container } = renderWithProviders(<GoalAnalytics goals={mockGoals} />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
  });

  it('applies motion animations to cards', () => {
    const { container } = renderWithProviders(<GoalAnalytics goals={mockGoals} />);

    const cards = container.querySelectorAll('.hover\\:shadow-lg');
    expect(cards.length).toBe(4);
  });
});
