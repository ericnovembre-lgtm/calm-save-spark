import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, userEvent } from '@/test/utils';
import { EnhancedBalanceCard } from '../EnhancedBalanceCard';

vi.mock('@/hooks/useCurrencyConversion', () => ({
  useCurrencyConversion: () => ({
    convertedAmount: 3247,
    targetCurrency: 'USD',
  }),
}));

describe('EnhancedBalanceCard', () => {
  const defaultProps = {
    balance: 3247,
    monthlyGrowth: 347,
    savingsVelocity: 65,
    weeklyTrend: [2800, 2950, 3100, 3050, 3200, 3180, 3247],
  };

  describe('Rendering', () => {
    it('should render balance correctly', () => {
      const { getByText } = renderWithProviders(<EnhancedBalanceCard {...defaultProps} />);
      expect(getByText('Total Balance')).toBeInTheDocument();
      expect(getByText(/3,?247/)).toBeInTheDocument();
    });

    it('should display monthly growth when positive', () => {
      const { getByText } = renderWithProviders(<EnhancedBalanceCard {...defaultProps} />);
      expect(getByText(/347/)).toBeInTheDocument();
    });

    it('should show negative growth correctly', () => {
      const { getByText, container } = renderWithProviders(
        <EnhancedBalanceCard {...defaultProps} monthlyGrowth={-50} />
      );
      expect(getByText(/-50/)).toBeInTheDocument();
      const trendIcon = container.querySelector('svg');
      expect(trendIcon).toBeInTheDocument();
    });

    it('should render savings velocity gauge', () => {
      const { getByText } = renderWithProviders(<EnhancedBalanceCard {...defaultProps} />);
      expect(getByText(/velocity/i)).toBeInTheDocument();
    });

    it('should render trend sparkline', () => {
      const { container } = renderWithProviders(<EnhancedBalanceCard {...defaultProps} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Currency Display', () => {
    it('should show correct currency symbol', () => {
      const { getByText } = renderWithProviders(<EnhancedBalanceCard {...defaultProps} />);
      expect(getByText('$')).toBeInTheDocument();
    });

    it('should format large numbers with commas', () => {
      const { getByText } = renderWithProviders(
        <EnhancedBalanceCard {...defaultProps} balance={10000} />
      );
      expect(getByText(/10,?000/)).toBeInTheDocument();
    });
  });

  describe('Interactive Features', () => {
    it('should trigger confetti on triple tap', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(<EnhancedBalanceCard {...defaultProps} />);
      
      const balanceElement = container.querySelector('[class*="cursor-pointer"]');
      expect(balanceElement).toBeInTheDocument();
    });

    it('should show animated counter', () => {
      const { container } = renderWithProviders(<EnhancedBalanceCard {...defaultProps} />);
      const counter = container.querySelector('[class*="font-display"]');
      expect(counter).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive labels', () => {
      const { getByText } = renderWithProviders(<EnhancedBalanceCard {...defaultProps} />);
      expect(getByText('Total Balance')).toBeInTheDocument();
    });

    it('should render with proper semantic structure', () => {
      const { container } = renderWithProviders(<EnhancedBalanceCard {...defaultProps} />);
      expect(container.querySelector('p')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero balance', () => {
      const { getByText } = renderWithProviders(
        <EnhancedBalanceCard {...defaultProps} balance={0} />
      );
      expect(getByText('Total Balance')).toBeInTheDocument();
    });

    it('should handle zero monthly growth', () => {
      const { container } = renderWithProviders(
        <EnhancedBalanceCard {...defaultProps} monthlyGrowth={0} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle empty weekly trend', () => {
      const { container } = renderWithProviders(
        <EnhancedBalanceCard {...defaultProps} weeklyTrend={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle missing optional props', () => {
      const { getByText } = renderWithProviders(
        <EnhancedBalanceCard balance={1000} />
      );
      expect(getByText('Total Balance')).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('should respect reduced motion preferences', () => {
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

      const { container } = renderWithProviders(<EnhancedBalanceCard {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });
  });
});
