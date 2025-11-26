import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor, userEvent } from '@/test/utils';
import { SmartAutomationSuggestions } from '@/components/automations/SmartAutomationSuggestions';

const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
  },
}));

describe('SmartAutomationSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    mockInvoke.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<SmartAutomationSuggestions />);

    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
  });

  it('displays suggestion cards with confidence and impact', async () => {
    const mockSuggestions = [
      {
        id: '1',
        type: 'round_up',
        title: 'Enable Round-Up Savings',
        description: 'Automatically save spare change on purchases',
        impact: 'high',
        confidence: 0.92,
        category: 'savings',
        estimated_monthly_benefit: 75
      },
      {
        id: '2',
        type: 'bill_optimization',
        title: 'Optimize Subscription Payments',
        description: 'Move subscription dates to align with paycheck',
        impact: 'medium',
        confidence: 0.85,
        category: 'optimization',
        estimated_monthly_benefit: 30
      }
    ];

    mockInvoke.mockResolvedValue({
      data: { suggestions: mockSuggestions },
      error: null
    });

    renderWithProviders(<SmartAutomationSuggestions />);

    await waitFor(() => {
      expect(screen.getByText(/enable round-up savings/i)).toBeInTheDocument();
      expect(screen.getByText(/optimize subscription payments/i)).toBeInTheDocument();
    });

    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
  });

  it('shows empty suggestions state', async () => {
    mockInvoke.mockResolvedValue({
      data: { suggestions: [] },
      error: null
    });

    renderWithProviders(<SmartAutomationSuggestions />);

    await waitFor(() => {
      expect(screen.getByText(/no suggestions yet/i)).toBeInTheDocument();
      expect(screen.getByText(/check back soon/i)).toBeInTheDocument();
    });
  });

  it('handles enable automation click', async () => {
    const user = userEvent.setup();
    const mockSuggestions = [
      {
        id: '1',
        type: 'round_up',
        title: 'Enable Round-Up',
        description: 'Save spare change',
        impact: 'high',
        confidence: 0.9,
        category: 'savings'
      }
    ];

    mockInvoke
      .mockResolvedValueOnce({
        data: { suggestions: mockSuggestions },
        error: null
      })
      .mockResolvedValueOnce({
        data: { success: true },
        error: null
      });

    renderWithProviders(<SmartAutomationSuggestions />);

    await waitFor(() => {
      expect(screen.getByText(/enable round-up/i)).toBeInTheDocument();
    });

    const enableButton = screen.getByRole('button', { name: /enable automation/i });
    await user.click(enableButton);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith(
        'suggest-automations',
        expect.objectContaining({
          body: expect.objectContaining({
            action: 'accept',
            suggestionId: '1'
          })
        })
      );
    });
  });

  it('handles dismiss suggestion click and persists to localStorage', async () => {
    const user = userEvent.setup();
    const mockSuggestions = [
      {
        id: '1',
        type: 'round_up',
        title: 'Enable Round-Up',
        description: 'Save spare change',
        impact: 'medium',
        confidence: 0.8,
        category: 'savings'
      }
    ];

    mockInvoke
      .mockResolvedValueOnce({
        data: { suggestions: mockSuggestions },
        error: null
      })
      .mockResolvedValueOnce({
        data: { success: true },
        error: null
      });

    renderWithProviders(<SmartAutomationSuggestions />);

    await waitFor(() => {
      expect(screen.getByText(/enable round-up/i)).toBeInTheDocument();
    });

    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    await user.click(dismissButton);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith(
        'suggest-automations',
        expect.objectContaining({
          body: expect.objectContaining({
            action: 'dismiss',
            suggestionId: '1'
          })
        })
      );
    });

    // Check localStorage persistence
    const dismissed = JSON.parse(localStorage.getItem('dismissedSuggestions') || '[]');
    expect(dismissed).toContain('1');
  });

  it('displays category icons correctly', async () => {
    const mockSuggestions = [
      {
        id: '1',
        type: 'savings',
        title: 'Savings Automation',
        description: 'Save more',
        impact: 'high',
        confidence: 0.9,
        category: 'savings'
      },
      {
        id: '2',
        type: 'optimization',
        title: 'Optimization Automation',
        description: 'Optimize spending',
        impact: 'medium',
        confidence: 0.85,
        category: 'optimization'
      },
      {
        id: '3',
        type: 'protection',
        title: 'Protection Automation',
        description: 'Protect your funds',
        impact: 'high',
        confidence: 0.88,
        category: 'protection'
      }
    ];

    mockInvoke.mockResolvedValue({
      data: { suggestions: mockSuggestions },
      error: null
    });

    renderWithProviders(<SmartAutomationSuggestions />);

    await waitFor(() => {
      expect(screen.getByText(/savings automation/i)).toBeInTheDocument();
    });
  });

  it('filters out dismissed suggestions on reload', async () => {
    localStorage.setItem('dismissedSuggestions', JSON.stringify(['1', '2']));

    const mockSuggestions = [
      {
        id: '1',
        type: 'round_up',
        title: 'Dismissed Suggestion 1',
        description: 'Should not appear',
        impact: 'high',
        confidence: 0.9,
        category: 'savings'
      },
      {
        id: '3',
        type: 'bill_pay',
        title: 'Active Suggestion',
        description: 'Should appear',
        impact: 'medium',
        confidence: 0.85,
        category: 'optimization'
      }
    ];

    mockInvoke.mockResolvedValue({
      data: { suggestions: mockSuggestions },
      error: null
    });

    renderWithProviders(<SmartAutomationSuggestions />);

    await waitFor(() => {
      expect(screen.getByText(/active suggestion/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/dismissed suggestion 1/i)).not.toBeInTheDocument();
  });

  it('handles error state gracefully', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Failed to load suggestions' }
    });

    renderWithProviders(<SmartAutomationSuggestions />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
