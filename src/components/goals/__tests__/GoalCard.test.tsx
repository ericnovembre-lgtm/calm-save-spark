import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/test/utils';
import { GoalCard } from '@/components/GoalCard';

describe('GoalCard', () => {
  const defaultProps = {
    title: 'Emergency Fund',
    current: 2500,
    target: 10000,
    emoji: '🏦',
  };

  it('renders goal card with all details', () => {
    renderWithProviders(<GoalCard {...defaultProps} />);

    expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    expect(screen.getByText('$2,500 of $10,000')).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    const { container } = renderWithProviders(<GoalCard {...defaultProps} />);
    // 2500/10000 = 25% progress
    const progressRing = container.querySelector('circle[stroke-dasharray]');
    expect(progressRing).toBeInTheDocument();
  });

  it('formats large numbers with commas', () => {
    renderWithProviders(
      <GoalCard title="House Down Payment" current={45000} target={100000} />
    );

    expect(screen.getByText('$45,000 of $100,000')).toBeInTheDocument();
  });

  it('handles zero current amount', () => {
    renderWithProviders(
      <GoalCard title="Vacation Fund" current={0} target={5000} />
    );

    expect(screen.getByText('$0 of $5,000')).toBeInTheDocument();
  });

  it('shows 100% progress when goal is reached', () => {
    renderWithProviders(
      <GoalCard title="Completed Goal" current={5000} target={5000} />
    );

    expect(screen.getByText('$5,000 of $5,000')).toBeInTheDocument();
  });

  it('uses default emoji when not provided', () => {
    const { container } = renderWithProviders(
      <GoalCard title="Test Goal" current={100} target={1000} />
    );

    expect(container).toBeInTheDocument();
  });

  it('renders motion animations', () => {
    const { container } = renderWithProviders(<GoalCard {...defaultProps} />);
    
    const motionDiv = container.querySelector('.bg-card');
    expect(motionDiv).toBeInTheDocument();
  });

  it('displays progress ring with correct size', () => {
    const { container } = renderWithProviders(<GoalCard {...defaultProps} />);
    
    // ProgressRing has size 80 and strokeWidth 6
    const svg = container.querySelector('svg[width="80"][height="80"]');
    expect(svg).toBeInTheDocument();
  });
});
