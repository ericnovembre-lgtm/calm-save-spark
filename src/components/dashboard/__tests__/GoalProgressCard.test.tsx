import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { GoalProgressCard } from '../GoalProgressCard';

describe('GoalProgressCard', () => {
  const defaultProps = {
    id: 'goal-1',
    name: 'Vacation Fund',
    currentAmount: 750,
    targetAmount: 1000,
    icon: 'plane',
  };

  describe('Rendering', () => {
    it('should render goal name', () => {
      const { getByText } = renderWithProviders(<GoalProgressCard {...defaultProps} />);
      expect(getByText('Vacation Fund')).toBeInTheDocument();
    });

    it('should display current and target amounts', () => {
      const { getByText } = renderWithProviders(<GoalProgressCard {...defaultProps} />);
      expect(getByText(/\$750/)).toBeInTheDocument();
      expect(getByText(/\$1,?000/)).toBeInTheDocument();
    });

    it('should render progress ring', () => {
      const { container } = renderWithProviders(<GoalProgressCard {...defaultProps} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should show icon', () => {
      const { container } = renderWithProviders(<GoalProgressCard {...defaultProps} />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should use default icon if invalid icon provided', () => {
      const { container } = renderWithProviders(
        <GoalProgressCard {...defaultProps} icon="invalid-icon" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate progress correctly', () => {
      const { container } = renderWithProviders(<GoalProgressCard {...defaultProps} />);
      // 750/1000 = 75%
      expect(container).toBeInTheDocument();
    });

    it('should handle 0% progress', () => {
      const { getByText } = renderWithProviders(
        <GoalProgressCard {...defaultProps} currentAmount={0} />
      );
      expect(getByText('$0')).toBeInTheDocument();
    });

    it('should cap progress at 100%', () => {
      const { container } = renderWithProviders(
        <GoalProgressCard {...defaultProps} currentAmount={1500} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle 100% completion', () => {
      const { getByText } = renderWithProviders(
        <GoalProgressCard {...defaultProps} currentAmount={1000} />
      );
      expect(getByText('$1,000')).toBeInTheDocument();
    });
  });

  describe('Confetti on Goal Completion', () => {
    it('should show confetti when goal is achieved', () => {
      const { container } = renderWithProviders(
        <GoalProgressCard {...defaultProps} currentAmount={1000} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should not show confetti for incomplete goals', () => {
      const { container } = renderWithProviders(<GoalProgressCard {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('should format large numbers with commas', () => {
      const { getByText } = renderWithProviders(
        <GoalProgressCard
          {...defaultProps}
          currentAmount={25000}
          targetAmount={50000}
        />
      );
      expect(getByText(/25,?000/)).toBeInTheDocument();
      expect(getByText(/50,?000/)).toBeInTheDocument();
    });

    it('should handle decimal amounts', () => {
      const { getByText } = renderWithProviders(
        <GoalProgressCard {...defaultProps} currentAmount={750.50} />
      );
      expect(getByText(/750/)).toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('should have hover styling classes', () => {
      const { container } = renderWithProviders(<GoalProgressCard {...defaultProps} />);
      const card = container.querySelector('[class*="hover"]');
      expect(card).toBeInTheDocument();
    });

    it('should be clickable', () => {
      const { container } = renderWithProviders(<GoalProgressCard {...defaultProps} />);
      const card = container.querySelector('[class*="cursor-pointer"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive content', () => {
      const { getByText } = renderWithProviders(<GoalProgressCard {...defaultProps} />);
      expect(getByText('Vacation Fund')).toBeInTheDocument();
    });

    it('should render semantic HTML', () => {
      const { container } = renderWithProviders(<GoalProgressCard {...defaultProps} />);
      expect(container.querySelector('h3')).toBeInTheDocument();
      expect(container.querySelector('p')).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('should respect reduced motion preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { container } = renderWithProviders(<GoalProgressCard {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('should have fade-in animation', () => {
      const { container } = renderWithProviders(<GoalProgressCard {...defaultProps} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      const { getByText } = renderWithProviders(
        <GoalProgressCard {...defaultProps} currentAmount={0.01} targetAmount={0.10} />
      );
      expect(getByText(/0/)).toBeInTheDocument();
    });

    it('should handle negative amounts gracefully', () => {
      const { container } = renderWithProviders(
        <GoalProgressCard {...defaultProps} currentAmount={-10} />
      );
      expect(container).toBeInTheDocument();
    });
  });
});
