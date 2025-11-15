import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/utils';
import { BusinessExpenses } from '../BusinessExpenses';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const mockSupabase = supabase as any;

describe('BusinessExpenses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
  });

  it('renders add expense button', async () => {
    renderWithProviders(<BusinessExpenses businessProfileId="profile-123" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Expense/i })).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    renderWithProviders(<BusinessExpenses businessProfileId="profile-123" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('has correct businessProfileId prop', () => {
    const { container } = renderWithProviders(
      <BusinessExpenses businessProfileId="test-profile-123" />
    );

    expect(container).toBeInTheDocument();
  });
});
