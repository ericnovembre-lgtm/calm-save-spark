import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/utils';
import { PredictiveHealthScore } from '@/components/health/PredictiveHealthScore';

const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
  },
}));

describe('PredictiveHealthScore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    mockInvoke.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<PredictiveHealthScore />);

    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });

  it('displays current score with color coding', async () => {
    const mockPrediction = {
      current_score: 85,
      predicted_30d: 87,
      predicted_60d: 89,
      predicted_90d: 90,
      factors: [],
      recommendations: []
    };

    mockInvoke.mockResolvedValue({
      data: mockPrediction,
      error: null
    });

    renderWithProviders(<PredictiveHealthScore />);

    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText(/excellent/i)).toBeInTheDocument();
    });
  });

  it('shows 30/60/90 day predictions', async () => {
    const mockPrediction = {
      current_score: 75,
      predicted_30d: 78,
      predicted_60d: 80,
      predicted_90d: 82,
      factors: [],
      recommendations: []
    };

    mockInvoke.mockResolvedValue({
      data: mockPrediction,
      error: null
    });

    renderWithProviders(<PredictiveHealthScore />);

    await waitFor(() => {
      expect(screen.getByText('78')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('82')).toBeInTheDocument();
    });

    expect(screen.getByText(/30 days/i)).toBeInTheDocument();
    expect(screen.getByText(/60 days/i)).toBeInTheDocument();
    expect(screen.getByText(/90 days/i)).toBeInTheDocument();
  });

  it('displays factor trends with correct indicators', async () => {
    const mockPrediction = {
      current_score: 70,
      predicted_30d: 72,
      predicted_60d: 74,
      predicted_90d: 76,
      factors: [
        {
          factor: 'Savings Rate',
          impact: 15,
          trend: 'improving',
          description: 'Savings rate is increasing'
        },
        {
          factor: 'Debt Ratio',
          impact: -10,
          trend: 'declining',
          description: 'Debt ratio is worsening'
        },
        {
          factor: 'Emergency Fund',
          impact: 5,
          trend: 'stable',
          description: 'Emergency fund is stable'
        }
      ],
      recommendations: []
    };

    mockInvoke.mockResolvedValue({
      data: mockPrediction,
      error: null
    });

    renderWithProviders(<PredictiveHealthScore />);

    await waitFor(() => {
      expect(screen.getByText(/savings rate/i)).toBeInTheDocument();
      expect(screen.getByText(/debt ratio/i)).toBeInTheDocument();
      expect(screen.getByText(/emergency fund/i)).toBeInTheDocument();
    });

    // Check for trend indicators (emoji or icons)
    expect(screen.getByText('📈')).toBeInTheDocument(); // improving
    expect(screen.getByText('📉')).toBeInTheDocument(); // declining
    expect(screen.getByText('➡️')).toBeInTheDocument(); // stable
  });

  it('renders recommendations with priority', async () => {
    const mockPrediction = {
      current_score: 65,
      predicted_30d: 67,
      predicted_60d: 69,
      predicted_90d: 71,
      factors: [],
      recommendations: [
        {
          action: 'Increase emergency fund',
          impact_score: 20,
          priority: 'high'
        },
        {
          action: 'Reduce discretionary spending',
          impact_score: 15,
          priority: 'medium'
        },
        {
          action: 'Review subscription costs',
          impact_score: 8,
          priority: 'low'
        }
      ]
    };

    mockInvoke.mockResolvedValue({
      data: mockPrediction,
      error: null
    });

    renderWithProviders(<PredictiveHealthScore />);

    await waitFor(() => {
      expect(screen.getByText(/increase emergency fund/i)).toBeInTheDocument();
      expect(screen.getByText(/reduce discretionary spending/i)).toBeInTheDocument();
      expect(screen.getByText(/review subscription costs/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
    expect(screen.getByText(/low/i)).toBeInTheDocument();
  });

  it('applies correct color classes based on score ranges', async () => {
    const testCases = [
      { score: 85, expectedClass: 'green', expectedLabel: 'Excellent' },
      { score: 70, expectedClass: 'yellow', expectedLabel: 'Good' },
      { score: 50, expectedClass: 'orange', expectedLabel: 'Fair' },
      { score: 30, expectedClass: 'red', expectedLabel: 'Needs Attention' }
    ];

    for (const testCase of testCases) {
      vi.clearAllMocks();
      
      mockInvoke.mockResolvedValue({
        data: {
          current_score: testCase.score,
          predicted_30d: testCase.score,
          predicted_60d: testCase.score,
          predicted_90d: testCase.score,
          factors: [],
          recommendations: []
        },
        error: null
      });

      const { unmount } = renderWithProviders(<PredictiveHealthScore />);

      await waitFor(() => {
        expect(screen.getByText(testCase.expectedLabel)).toBeInTheDocument();
      });

      unmount();
    }
  });

  it('handles error state gracefully', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Failed to predict health score' }
    });

    renderWithProviders(<PredictiveHealthScore />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('handles missing data gracefully', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: null
    });

    renderWithProviders(<PredictiveHealthScore />);

    await waitFor(() => {
      expect(screen.getByText(/no prediction data/i)).toBeInTheDocument();
    });
  });
});
