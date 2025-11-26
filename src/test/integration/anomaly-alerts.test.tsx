import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor, userEvent } from '@/test/utils';
import { AnomalyAlertCenter } from '@/components/ai/AnomalyAlertCenter';

const mockFrom = vi.fn();
const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    }
  },
}));

describe('AnomalyAlertCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    });
  });

  it('renders loading state initially', () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    renderWithProviders(<AnomalyAlertCenter />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays anomaly cards with severity badges', async () => {
    const mockAnomalies = [
      {
        id: '1',
        anomaly_type: 'unusual_spending',
        severity: 'high',
        description: 'Spending 150% above normal',
        confidence_score: 0.89,
        potential_impact: 375,
        suggested_action: 'Review expenses',
        status: 'active'
      },
      {
        id: '2',
        anomaly_type: 'duplicate_transaction',
        severity: 'low',
        description: 'Potential duplicate charge',
        confidence_score: 0.75,
        potential_impact: 45.99,
        suggested_action: 'Review transactions',
        status: 'active'
      }
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockAnomalies, error: null }),
    });

    renderWithProviders(<AnomalyAlertCenter />);

    await waitFor(() => {
      expect(screen.getByText(/spending 150% above normal/i)).toBeInTheDocument();
      expect(screen.getByText(/potential duplicate charge/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/low/i)).toBeInTheDocument();
  });

  it('shows "All Clear" state when no active anomalies', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    renderWithProviders(<AnomalyAlertCenter />);

    await waitFor(() => {
      expect(screen.getByText(/all clear/i)).toBeInTheDocument();
      expect(screen.getByText(/no anomalies detected/i)).toBeInTheDocument();
    });
  });

  it('displays summary badge with anomaly count', async () => {
    const mockAnomalies = [
      { id: '1', status: 'active', severity: 'high', description: 'Anomaly 1' },
      { id: '2', status: 'active', severity: 'medium', description: 'Anomaly 2' },
      { id: '3', status: 'active', severity: 'low', description: 'Anomaly 3' }
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockAnomalies, error: null }),
    });

    renderWithProviders(<AnomalyAlertCenter />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('handles resolve button click', async () => {
    const user = userEvent.setup();
    const mockAnomalies = [
      {
        id: '1',
        anomaly_type: 'unusual_spending',
        severity: 'high',
        description: 'High spending',
        status: 'active'
      }
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockAnomalies, error: null }),
      update: vi.fn().mockReturnThis(),
    });

    renderWithProviders(<AnomalyAlertCenter />);

    await waitFor(() => {
      expect(screen.getByText(/high spending/i)).toBeInTheDocument();
    });

    const resolveButton = screen.getByRole('button', { name: /resolve/i });
    await user.click(resolveButton);

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('financial_anomalies');
    });
  });

  it('handles dismiss button click', async () => {
    const user = userEvent.setup();
    const mockAnomalies = [
      {
        id: '1',
        anomaly_type: 'duplicate_transaction',
        severity: 'low',
        description: 'Low priority',
        status: 'active'
      }
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockAnomalies, error: null }),
      update: vi.fn().mockReturnThis(),
    });

    renderWithProviders(<AnomalyAlertCenter />);

    await waitFor(() => {
      expect(screen.getByText(/low priority/i)).toBeInTheDocument();
    });

    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    await user.click(dismissButton);

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('financial_anomalies');
    });
  });

  it('handles error state gracefully', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      }),
    });

    renderWithProviders(<AnomalyAlertCenter />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
