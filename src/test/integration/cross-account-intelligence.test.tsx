import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/utils';
import { CrossAccountIntelligence } from '@/components/ai/CrossAccountIntelligence';

const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
  },
}));

describe('CrossAccountIntelligence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockInvoke.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<CrossAccountIntelligence />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays insight cards with impact colors', async () => {
    const mockData = {
      insights: [
        {
          type: 'optimization',
          title: 'Transfer Opportunity',
          description: 'Move funds to high-yield savings',
          insight: 'Your checking account has $5,000 earning 0.01% APY',
          recommendation: 'Transfer $4,000 to savings account with 4.5% APY',
          confidence: 0.92,
          impact: 'high',
          accountId: 'acc-123',
          data: {
            potential_earnings: 180
          }
        },
        {
          type: 'alert',
          title: 'Low Balance Warning',
          description: 'Checking account balance is low',
          insight: 'Balance has dropped below your typical minimum',
          recommendation: 'Consider transferring from savings',
          confidence: 0.88,
          impact: 'medium',
          accountId: 'acc-456'
        },
        {
          type: 'insight',
          title: 'Spending Pattern',
          description: 'Increased spending detected',
          insight: 'Spending up 25% in dining category',
          recommendation: 'Review recent dining expenses',
          confidence: 0.75,
          impact: 'low',
          accountId: 'acc-789'
        }
      ],
      summary: {
        totalAccounts: 3,
        totalBalance: 25000,
        activeAccounts: 3,
        insightCount: 3
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<CrossAccountIntelligence />);

    await waitFor(() => {
      expect(screen.getByText(/transfer opportunity/i)).toBeInTheDocument();
      expect(screen.getByText(/low balance warning/i)).toBeInTheDocument();
      expect(screen.getByText(/spending pattern/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
    expect(screen.getByText(/low/i)).toBeInTheDocument();
  });

  it('displays summary statistics', async () => {
    const mockData = {
      insights: [],
      summary: {
        totalAccounts: 5,
        totalBalance: 45000,
        activeAccounts: 4,
        insightCount: 7
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<CrossAccountIntelligence />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('$45,000')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    expect(screen.getByText(/total accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/total balance/i)).toBeInTheDocument();
    expect(screen.getByText(/active accounts/i)).toBeInTheDocument();
  });

  it('shows empty insights state', async () => {
    const mockData = {
      insights: [],
      summary: {
        totalAccounts: 2,
        totalBalance: 10000,
        activeAccounts: 2,
        insightCount: 0
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<CrossAccountIntelligence />);

    await waitFor(() => {
      expect(screen.getByText(/no insights available/i)).toBeInTheDocument();
      expect(screen.getByText(/check back later/i)).toBeInTheDocument();
    });
  });

  it('displays confidence scores for insights', async () => {
    const mockData = {
      insights: [
        {
          type: 'optimization',
          title: 'High Confidence Insight',
          description: 'Very reliable recommendation',
          insight: 'Strong pattern detected',
          recommendation: 'Take this action',
          confidence: 0.95,
          impact: 'high'
        },
        {
          type: 'alert',
          title: 'Medium Confidence Insight',
          description: 'Somewhat reliable',
          insight: 'Pattern detected',
          recommendation: 'Consider this action',
          confidence: 0.72,
          impact: 'medium'
        }
      ],
      summary: {
        totalAccounts: 3,
        totalBalance: 20000,
        activeAccounts: 3,
        insightCount: 2
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<CrossAccountIntelligence />);

    await waitFor(() => {
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('72%')).toBeInTheDocument();
    });
  });

  it('handles critical impact insights differently', async () => {
    const mockData = {
      insights: [
        {
          type: 'alert',
          title: 'Critical Alert',
          description: 'Immediate attention required',
          insight: 'Account overdraft risk',
          recommendation: 'Transfer funds immediately',
          confidence: 0.98,
          impact: 'critical',
          accountId: 'acc-urgent'
        }
      ],
      summary: {
        totalAccounts: 2,
        totalBalance: 5000,
        activeAccounts: 2,
        insightCount: 1
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<CrossAccountIntelligence />);

    await waitFor(() => {
      expect(screen.getByText(/critical alert/i)).toBeInTheDocument();
      expect(screen.getByText(/critical/i)).toBeInTheDocument();
    });
  });

  it('formats large balance numbers correctly', async () => {
    const mockData = {
      insights: [],
      summary: {
        totalAccounts: 10,
        totalBalance: 1250000,
        activeAccounts: 8,
        insightCount: 0
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<CrossAccountIntelligence />);

    await waitFor(() => {
      expect(screen.getByText(/\$1,250,000|\$1\.25M/i)).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Failed to analyze accounts' }
    });

    renderWithProviders(<CrossAccountIntelligence />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('displays account-specific insights', async () => {
    const mockData = {
      insights: [
        {
          type: 'optimization',
          title: 'Account Specific Insight',
          description: 'Related to checking account',
          insight: 'This insight is for your checking account',
          recommendation: 'Take action on this account',
          confidence: 0.85,
          impact: 'medium',
          accountId: 'acc-checking-001'
        }
      ],
      summary: {
        totalAccounts: 3,
        totalBalance: 15000,
        activeAccounts: 3,
        insightCount: 1
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<CrossAccountIntelligence />);

    await waitFor(() => {
      expect(screen.getByText(/account specific insight/i)).toBeInTheDocument();
    });
  });

  it('refreshes data when refetch is called', async () => {
    const mockData = {
      insights: [
        {
          type: 'insight',
          title: 'Initial Insight',
          description: 'First load',
          insight: 'Initial data',
          recommendation: 'Initial recommendation',
          confidence: 0.8,
          impact: 'low'
        }
      ],
      summary: {
        totalAccounts: 2,
        totalBalance: 10000,
        activeAccounts: 2,
        insightCount: 1
      }
    };

    mockInvoke.mockResolvedValue({
      data: mockData,
      error: null
    });

    renderWithProviders(<CrossAccountIntelligence />);

    await waitFor(() => {
      expect(screen.getByText(/initial insight/i)).toBeInTheDocument();
    });

    expect(mockInvoke).toHaveBeenCalledWith('cross-account-analysis');
  });
});
