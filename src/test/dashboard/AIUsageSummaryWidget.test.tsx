import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { AIUsageSummaryWidget } from '@/components/dashboard/AIUsageSummaryWidget';
import { createMockAIUsageSummary, createMockEmptyUsageSummary } from '@/test/mocks/aiUsageMocks';

// Mock the hook
vi.mock('@/hooks/useUserAIUsageSummary', () => ({
  useUserAIUsageSummary: vi.fn(),
}));

import { useUserAIUsageSummary } from '@/hooks/useUserAIUsageSummary';

const mockUseUserAIUsageSummary = vi.mocked(useUserAIUsageSummary);

describe('AIUsageSummaryWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('renders loading skeleton when loading', () => {
      mockUseUserAIUsageSummary.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isPending: true,
        isSuccess: false,
        status: 'pending',
      } as any);

      const { container } = renderWithProviders(<AIUsageSummaryWidget />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('returns null when no data', () => {
      mockUseUserAIUsageSummary.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
      } as any);

      const { container } = renderWithProviders(<AIUsageSummaryWidget />);
      expect(container.firstChild).toBeNull();
    });

    it('returns null when totalAnalyses is 0', () => {
      mockUseUserAIUsageSummary.mockReturnValue({
        data: createMockEmptyUsageSummary(),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
      } as any);

      const { container } = renderWithProviders(<AIUsageSummaryWidget />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Stats Display', () => {
    beforeEach(() => {
      mockUseUserAIUsageSummary.mockReturnValue({
        data: createMockAIUsageSummary(),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
      } as any);
    });

    it('displays total analyses count', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      expect(screen.getByText('47')).toBeInTheDocument();
      expect(screen.getByText('AI analyses this month')).toBeInTheDocument();
    });

    it('displays estimated savings', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      expect(screen.getByText('$22.56')).toBeInTheDocument();
      expect(screen.getByText('estimated saved')).toBeInTheDocument();
    });

    it('displays efficiency percentage', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      expect(screen.getByText('89%')).toBeInTheDocument();
      expect(screen.getByText('Efficiency')).toBeInTheDocument();
    });

    it('displays widget title with icon', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      expect(screen.getByText('AI Working For You')).toBeInTheDocument();
    });
  });

  describe('Feature Breakdown', () => {
    beforeEach(() => {
      mockUseUserAIUsageSummary.mockReturnValue({
        data: createMockAIUsageSummary(),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
      } as any);
    });

    it('displays feature breakdown text', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      expect(screen.getByText('Your AI assistant helped with:')).toBeInTheDocument();
    });

    it('displays feature icons and counts', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      expect(screen.getByText('💰')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    it('limits to 3 features maximum', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      // Should show top 3 features, not 4th (Financial Insights with ✨)
      const featureBadges = screen.getAllByText(/budget optimizations|investment analyses|retirement projections/i);
      expect(featureBadges.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Chart Toggle', () => {
    beforeEach(() => {
      mockUseUserAIUsageSummary.mockReturnValue({
        data: createMockAIUsageSummary(),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
      } as any);
    });

    it('defaults to daily view', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      const dailyButton = screen.getByRole('button', { name: /daily/i });
      expect(dailyButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('toggles to weekly view when clicked', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      const weeklyButton = screen.getByRole('button', { name: /weekly/i });
      
      fireEvent.click(weeklyButton);
      
      expect(weeklyButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders chart with correct aria label', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      expect(screen.getByRole('img', { name: /ai usage daily trends chart/i })).toBeInTheDocument();
    });

    it('updates chart aria label when toggling to weekly', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      const weeklyButton = screen.getByRole('button', { name: /weekly/i });
      
      fireEvent.click(weeklyButton);
      
      expect(screen.getByRole('img', { name: /ai usage weekly trends chart/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseUserAIUsageSummary.mockReturnValue({
        data: createMockAIUsageSummary(),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
      } as any);
    });

    it('progress bar has aria-label', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      expect(screen.getByLabelText(/ai efficiency: 89%/i)).toBeInTheDocument();
    });

    it('link to ai-insights is accessible', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      const link = screen.getByRole('link', { name: /learn how ai helps/i });
      expect(link).toHaveAttribute('href', '/ai-insights');
    });

    it('toggle buttons have aria-pressed attribute', () => {
      renderWithProviders(<AIUsageSummaryWidget />);
      const dailyButton = screen.getByRole('button', { name: /daily/i });
      const weeklyButton = screen.getByRole('button', { name: /weekly/i });
      
      expect(dailyButton).toHaveAttribute('aria-pressed');
      expect(weeklyButton).toHaveAttribute('aria-pressed');
    });
  });

  describe('Edge Cases', () => {
    it('hides savings when 0', () => {
      mockUseUserAIUsageSummary.mockReturnValue({
        data: createMockAIUsageSummary({ estimatedSavings: 0 }),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
      } as any);

      renderWithProviders(<AIUsageSummaryWidget />);
      expect(screen.queryByText('estimated saved')).not.toBeInTheDocument();
    });

    it('hides feature breakdown when empty', () => {
      mockUseUserAIUsageSummary.mockReturnValue({
        data: createMockAIUsageSummary({ featureBreakdown: [] }),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
      } as any);

      renderWithProviders(<AIUsageSummaryWidget />);
      expect(screen.queryByText('Your AI assistant helped with:')).not.toBeInTheDocument();
    });

    it('handles single feature in breakdown', () => {
      mockUseUserAIUsageSummary.mockReturnValue({
        data: createMockAIUsageSummary({
          featureBreakdown: [{ feature: 'Budget Optimizations', count: 5, icon: '💰' }],
        }),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
      } as any);

      renderWithProviders(<AIUsageSummaryWidget />);
      expect(screen.getByText('💰')).toBeInTheDocument();
      expect(screen.getByText(/5 budget optimizations/i)).toBeInTheDocument();
    });
  });
});
