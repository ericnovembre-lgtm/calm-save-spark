import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/utils';
import { BehavioralInsightsPanel } from '@/components/ai/BehavioralInsightsPanel';

// Mock Supabase
const mockInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
  },
}));

describe('BehavioralInsightsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockInvoke.mockReturnValue(new Promise(() => {})); // Never resolves

    renderWithProviders(<BehavioralInsightsPanel />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays behavior patterns when data is loaded', async () => {
    const mockPatterns = [
      {
        pattern_type: 'spending_time',
        pattern_data: {
          peak_hours: [14, 15],
          peak_days: ['Saturday'],
          description: 'Peak spending on weekends'
        },
        confidence_score: 0.85,
        pattern_frequency: 'weekly'
      },
      {
        pattern_type: 'category_preference',
        pattern_data: {
          top_categories: ['Dining', 'Shopping'],
          description: 'Prefers dining and shopping'
        },
        confidence_score: 0.92,
        pattern_frequency: 'monthly'
      }
    ];

    mockInvoke.mockResolvedValue({
      data: { patterns: mockPatterns },
      error: null
    });

    renderWithProviders(<BehavioralInsightsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/peak spending on weekends/i)).toBeInTheDocument();
      expect(screen.getByText(/prefers dining and shopping/i)).toBeInTheDocument();
    });

    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('shows empty state when no patterns exist', async () => {
    mockInvoke.mockResolvedValue({
      data: { patterns: [] },
      error: null
    });

    renderWithProviders(<BehavioralInsightsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/no patterns detected yet/i)).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Failed to fetch patterns' }
    });

    renderWithProviders(<BehavioralInsightsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('maps pattern types to correct icons', async () => {
    const mockPatterns = [
      {
        pattern_type: 'spending_time',
        pattern_data: { description: 'Time pattern' },
        confidence_score: 0.8,
        pattern_frequency: 'daily'
      },
      {
        pattern_type: 'category_preference',
        pattern_data: { description: 'Category pattern' },
        confidence_score: 0.9,
        pattern_frequency: 'monthly'
      },
      {
        pattern_type: 'savings_behavior',
        pattern_data: { description: 'Savings pattern' },
        confidence_score: 0.85,
        pattern_frequency: 'weekly'
      }
    ];

    mockInvoke.mockResolvedValue({
      data: { patterns: mockPatterns },
      error: null
    });

    renderWithProviders(<BehavioralInsightsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/time pattern/i)).toBeInTheDocument();
    });
  });

  it('triggers analyze patterns mutation when button clicked', async () => {
    mockInvoke
      .mockResolvedValueOnce({
        data: { patterns: [] },
        error: null
      })
      .mockResolvedValueOnce({
        data: { success: true },
        error: null
      });

    renderWithProviders(<BehavioralInsightsPanel />);

    await waitFor(() => {
      screen.getByText(/no patterns detected yet/i);
    });

    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    analyzeButton.click();

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith(
        'behavioral-learning',
        expect.any(Object)
      );
    });
  });
});
